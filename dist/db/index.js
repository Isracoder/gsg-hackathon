import { DataSource } from "typeorm";
import { Image } from "./entities/Image.js";
const dataSource = new DataSource({
    type: "mysql",
    host: "localhost",
    port: 3306,
    username: "root",
    password: "",
    database: "ImageRecognition",
    entities: [Image],
    synchronize: true,
    logging: true,
});
const initialize = () => {
    dataSource
        .initialize()
        .then(() => {
        console.log("Connected");
    })
        .catch((err) => {
        console.log(`A ${err} has occurred :( , Failed to connect to the DB`);
    });
};
export default { initialize, dataSource };
