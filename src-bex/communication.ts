export enum Status {
  SETUP = 'Setup',
  LOGIN = 'Login',
  CONNECTED = 'Connected',
}

export enum MessageType {
  GET_STATUS = 'GetStatus',
  UPDATE_STATUS = 'UpdateStatus',
  GET_LOG_INFO = 'GetLogInfo', //cryptkey and url fires from axios to background
  UPDATE_TOKEN = 'UpdateToken', //Whenever the login token is updated, fires from background to boot/axios file
  CORRECT_SETUP = 'CorrectSetup', //When the setup is correct, fires from .vue to background to store in chrome storage
}
