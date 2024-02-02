export enum Status {
  SETUP = 'Setup',
  LOGIN = 'Login',
  CONNECTED = 'Connected',
}

export enum MessageType {
  GET_STATUS = 'GetStatus',
  SET_STATUS = 'SetStatus', //fires from any file to background to update the status in the application
  UPDATE_STATUS = 'UpdateStatus', //Whenever the status is updated in the app
  GET_LOG_INFO = 'GetLogInfo', //cryptkey and url fires from axios to background
  CONNECT = 'Connect', //Whenever connected, sends the token
  CORRECT_SETUP = 'CorrectSetup', //When the setup is correct, fires from .vue to background to store in chrome storage
  PAGE_LOADED = 'PageLoaded', //fires from content to background to tell when page is loaded,
  HTTP = 'Http'//Http request
}

//Data in the background file that stores everything needed for each tab
export interface TabData {
  url: string;//The url of the tab
  need_data: number;//If the tab needs data (case if > 0)
  has_data: boolean; //If the tab has data
  need_username: boolean;
  need_password: boolean;
}

export interface KdbexEntry {
  id: string;
  name: string;
  password: string;
  username: string;

}