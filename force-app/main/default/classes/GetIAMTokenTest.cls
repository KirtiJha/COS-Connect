@isTest
public class GetIAMTokenTest {
  @isTest
  static void testMakeCalloutToIAMEndpoint() {
    String jsonResponse = '{"access_token": "test_token_123","refresh_token": "not_supported","ims_user_id": 9714170,"token_type": "Bearer","expires_in": 3600,"expiration": 1650539028,"scope": "ibm openid"}';

    Test.startTest();
    Test.setMock(
      HttpCalloutMock.class,
      new GetIAMTokenHttpCalloutMock(jsonResponse, 200)
    );
    Test.stopTest();
    HttpResponse response = GetIAMToken.makeCalloutToIAMEndpoint();
    String contentType = response.getHeader('Content-Type');
    System.assert(
      contentType == 'application/json',
      'contentType is not matching'
    );
    String actualValue = response.getBody();
    String expectedValue = jsonResponse;
    System.assertEquals(expectedValue, actualValue, 'Response is wrong');
    System.assertEquals(200, response.getStatusCode(), 'Status code is wrong');
  }

  @isTest
  static void testGetCosTokenSuccess() {
    String jsonResponse = '{"access_token": "test_token_123","refresh_token": "not_supported","ims_user_id": 9714170,"token_type": "Bearer","expires_in": 3600,"expiration": 1650539028,"scope": "ibm openid"}';
    String token = ' test_token_123';

    Test.startTest();
    Test.setMock(
      HttpCalloutMock.class,
      new GetIAMTokenHttpCalloutMock(jsonResponse, 200)
    );
    Test.stopTest();
    String response = GetIAMToken.getCOSToken();
    System.assertEquals(token, response, 'Recieved token is wrong');
  }

  @isTest
  static void testGetCosTokenFailure() {
    String jsonResponse = '{"ERROR_MESSAGE": "Unable to get IAM token"}';
    String errorMessage = 'Unable to get IAM token';

    Test.startTest();
    Test.setMock(
      HttpCalloutMock.class,
      new GetIAMTokenHttpCalloutMock(jsonResponse, 400)
    );
    Test.stopTest();
    String response = GetIAMToken.getCOSToken();
    System.assertEquals(
      errorMessage,
      response,
      'Request to IAM endpoint is not failed'
    );
  }

  @isTest
  static void testGetCosUrl() {
    String url = GetIAMToken.getCosUrl();
    System.assertEquals(
      'https://s3.us-south.cloud-object-storage.appdomain.cloud/drr-cos-storage-dev',
      url,
      'Cos URL endpoint is not correct'
    );
  }
}