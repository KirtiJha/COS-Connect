/**
 * @author Kirti Jha
 *
 * @date 2022-03-01
 *
 * @description GetIAMToken class
 *
 */
public without sharing class GetIAMToken {
  /**
   * @description method to get COS IAM Token
   * @return token
   */
  @AuraEnabled
  public static String getCOSToken() {
    try {
      HttpResponse response = makeCalloutToIAMEndpoint();
      Integer statusCode = response.getStatusCode();

      if (statusCode == 200) {
        String responseBody = response.getBody();
        String token = responseBody.split(',')
          .get(0)
          .split(':')
          .get(1)
          .replace('"', '');
        return token;
      } else {
        return 'Unable to get IAM token';
      }
    } catch (Exception e) {
      return 'failure';
    }
  }
  /**
   * @description method to make HTTP Callout to IAM Endpoint
   * @return HTTPResponse
   */
  public static HttpResponse makeCalloutToIAMEndpoint() {
    Http http = new Http();
    HttpRequest request = new HttpRequest();
    request.setEndpoint('callout:COSToken');
    request.setMethod('POST');
    request.setHeader('content-type', 'application/x-www-form-urlencoded');
    request.setHeader('charset', 'utf-8');
    String payLoad =
      'grant_type=urn:ibm:params:oauth:grant-type:apikey' +
      '&apikey={!$Credential.Password}';
    request.setBody(payLoad);
    HttpResponse response = http.send(request);
    return response;
  }
  /**
   * @description method to get COS endpoint url from custom settings
   * @return COS endpoint url
   */
  @AuraEnabled(cacheable=true)
  public static String getCosUrl() {
    String cosUrl;
    try {
      if (
        COS_Endpoint__mdt.sObjectType.getDescribe().isAccessible()
      ) {
        COS_Endpoint__mdt cosEndpoint = [
          SELECT CosEndpoint__c
          FROM COS_Endpoint__mdt
          WHERE DeveloperName = 'url'
          LIMIT 1
        ];
        cosUrl = cosEndpoint.CosEndpoint__c;
      }
      return cosUrl;
    } catch (Exception e) {
      throw new AuraHandledException(e.getMessage());
    }
  }
}