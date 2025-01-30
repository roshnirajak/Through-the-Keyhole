let mode = "prod" //local, dev, prod
let BACKEND_API_URL = "http://127.0.0.1:8000";

switch (mode) {
    case "local":
        BACKEND_API_URL = "http://localhost:8000";
        break;
    case "dev":
        BACKEND_API_URL = "http://192.168.1.13:8000";
        break;
    case "prod":
        BACKEND_API_URL = "https://through-the-keyhole.space";
        break;
    default:
        BACKEND_API_URL = "http://localhost:8000";
        break;
}

export { BACKEND_API_URL };