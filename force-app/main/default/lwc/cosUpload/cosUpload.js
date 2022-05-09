import { LightningElement, api, track } from "lwc";
import getCOSToken from "@salesforce/apex/GetIAMToken.getCOSToken";
import getCosUrl from "@salesforce/apex/GetIAMToken.getCosUrl";

export default class CosUpload extends LightningElement {
  cosUrlEndpoint;

  @api recordId;

  showModal = false;

  @api show() {
    this.showModal = true;
  }

  @api hide() {
    this.showModal = false;
  }

  countAttachments;

  @track fileData = [];

  showSpinner = false;

  records = [];

  response = [];

  iamToken;

  // List down accepted file formats
  get acceptedFormats() {
    return [
      ".doc",
      ".docx",
      ".jpeg",
      ".jpg",
      ".pdf",
      ".png",
      ".ppt",
      ".pptx",
      ".eml",
      ".msg"
    ];
  }
  // Method to get IAM token
  async gettokenFromApex() {
    await getCOSToken()
      .then((result) => {
        console.log("IAM Token - " + result);
        this.iamToken = result;
      })
      .catch((error) => {
        console.log("Error in token generation");
        console.log(error);
      });
  }

  async getCosEndpointUrlFromApex() {
    await getCosUrl()
      .then((result) => {
        console.log("Cos Endpoint - " + result);
        this.cosUrlEndpoint = result;
      })
      .catch((error) => {
        console.log("Error getting cos url from custom metadata");
        console.log(error);
      });
  }
  // Open file upload
  async openfileUpload(event) {
    this.fileData = [];
    this.response = [];
    this.fileData = await Promise.all(
      [...event.target.files].map((file) => this.readFile(file))
    );
    this.show();
  }

  // eslint-disable-next-line class-methods-use-this
  // Read selected file
  readFile(fileSource) {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      const fileName = fileSource.name;
      const fileExtension = fileSource.name.split(".").pop();
      const iconName = this.generateIconName(fileExtension);
      fileReader.onerror = () => reject(fileReader.error);
      fileReader.onload = () =>
        resolve({ fileName, base64: fileReader.result, iconName });
      fileReader.readAsArrayBuffer(fileSource);
    });
  }
  // Upload multiple files
  async uploadMultiplefiles() {
    /* eslint-disable no-await-in-loop */

    for (let i = 0; i < this.fileData.length; i++) {
      const fileName = `${this.fileData[i].fileName}`;
      const fileContent = this.fileData[i].base64;
      await this.handleUploadFinished(fileContent, fileName);
    }
  }
  // Handle file upload
  async handleUploadFinished(fileContent, fileName) {
    await this.gettokenFromApex();
    await this.getCosEndpointUrlFromApex();

    const fileBody = fileContent;

    const url = `${this.cosUrlEndpoint}/${fileName}`;

    // parameters
    const requestOptions = {
      body: fileBody,
      method: "PUT",
      headers: {
        // eslint-disable-next-line prefer-template
        Authorization: "Bearer " + this.iamToken
      },
      redirect: "follow"
    };

    await fetch(url, requestOptions)
      .then(() => {
        this.response.push({ responseFileName: fileName });
        console.log(`Successfully Uploaded File - ${fileName}`);
      })
      .catch((error) => console.log(error));
  }

  removeReceiptImage(event) {
    const index = event.currentTarget.dataset.id;
    this.fileData.splice(index, 1);
  }

  async connectedCallback() {
    this.getFileNames();
    this.showSpinner = false;
  }
  // Method to get file names from COS
  async getFileNames() {
    this.records = [];
    await this.gettokenFromApex();
    await this.getCosEndpointUrlFromApex();
    const getUrl = `${this.cosUrlEndpoint}`;
    // parameters
    const requestOptions = {
      method: "GET",
      headers: {
        // eslint-disable-next-line prefer-template
        Authorization: "Bearer " + this.iamToken
      },
      redirect: "follow"
    };
    await fetch(getUrl, requestOptions)
      .then((response) => response.text())
      .then((result) => {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(result, "text/xml");
        const keys = xmlDoc.getElementsByTagName("Key");
        for (let i = 0; i < keys.length; i++) {
          const fileName = keys[i].childNodes[0].nodeValue;
          const fileExtension = fileName.split(".").pop();
          const iconName = this.generateIconName(fileExtension);
          this.records.push({
            filename: fileName,
            iconname: iconName,
            attachmentUrl: `${this.cosUrlEndpoint}/${fileName}`
          });
          this.records = [...new Set(this.records)];
        }
        this.countAttachments = this.records.length;
      })
      .catch((error) => console.log(error));
  }
  // Method to generate file icons
  generateIconName(fExtension) {
    const iconName =
      fExtension === "jpg" || fExtension === "jpeg" || fExtension === "PNG"
        ? "doctype:image"
        : fExtension === "docx"
        ? "doctype:word"
        : fExtension === "pptx"
        ? "doctype:ppt"
        : `doctype:${fExtension}`;
    return iconName;
  }
  showStatusModal = false;

  async closeHandler() {
    this.showSpinner = true;
    await this.uploadMultiplefiles();
    await this.connectedCallback();
    this.hide();
  }

  async cancelHandler() {
    this.hide();
    this.showStatusModal = false;
    await this.connectedCallback();
  }
}