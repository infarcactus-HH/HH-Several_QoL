import { GlobalStorageHandler } from "./utils/StorageHandler";

export default class UpdateHandler { // needs to test it on real script not a link to local file
    static run(){
        const currentVersion = GM_info.script.version;
        const storedVersion = GlobalStorageHandler.getStoredScriptVersion();
        if(storedVersion === currentVersion){
            return;
        }
        if(storedVersion === "0.0.0"){
            const values = GM_listValues();
            const partOfKeysToDelete: string[] = ["StoredGirls","EnumGirlsOrderedByClass_","PoPLastSortOfGirls"];
            values.forEach((key) => {
                if(partOfKeysToDelete.some(part => key.includes(part))){
                    GM_deleteValue(key);
                }
            });
        }
        GlobalStorageHandler.setStoredScriptVersion(currentVersion);
    }
}