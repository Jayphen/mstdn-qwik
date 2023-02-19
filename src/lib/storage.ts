import { createStorage } from "unstorage";
import fsDriver from "unstorage/drivers/fs";

const storage = createStorage({});

if (process.env.NODE_ENV === "development") {
  storage.mount("servers", fsDriver({ base: ".servers" }));
}

export { storage };
