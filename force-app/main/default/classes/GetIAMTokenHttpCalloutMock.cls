@isTest
global class GetIAMTokenHttpCalloutMock implements HttpCalloutMock {
  private String response;
  private Integer statusCode;
  public GetIAMTokenHttpCalloutMock(String response, Integer statusCode) {
    this.response = response;
    this.statusCode = statusCode;
  }
  global HttpResponse respond(HttpRequest req) {
    HttpResponse res = new HttpResponse();
    res.setHeader('Content-Type', 'application/json');
    res.setBody(response);
    res.setStatusCode(statusCode);
    return res;
  }
}
