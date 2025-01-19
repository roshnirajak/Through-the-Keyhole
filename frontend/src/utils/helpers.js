let mode = "local" //local, dev, production
let BACKEND_API_URL = "http://127.0.0.1:8000";

switch (mode){
    case "local":
        BACKEND_API_URL = "http://192.168.1.13:8000";
        break;
}
    
export { BACKEND_API_URL };