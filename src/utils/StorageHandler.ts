
export class StorageHandler {
    static getStoredGirlsNumber(): number {
        return GM_getValue(HH_UNIVERSE+'StoredGirls', 0);
    }
    static setStoredGirlsNumber(num: number): void {
        GM_setValue(HH_UNIVERSE+'StoredGirls', num);
    }
    static setEnumGirlsOrderedByClass(girls: number[], classType: 1 | 2 | 3): void {
        GM_setValue(HH_UNIVERSE+'EnumGirlsOrderedByClass_'+classType, girls);
    }
    static getEnumGirlsOrderedByClass(classType: 1 | 2 | 3): number[] {
        return GM_getValue(HH_UNIVERSE+'EnumGirlsOrderedByClass_'+classType, []);
    }
    static setLastSortOfGirls(nbGirls : number){
        GM_setValue(HH_UNIVERSE+'PoPLastSortOfGirls', nbGirls);
    }
    static getLastSortOfGirls(): number {
        return GM_getValue(HH_UNIVERSE+'PoPLastSortOfGirls', 0);
    }
    static setLeaguePLayerRecord(data: Array<{bestPlace: number, timesReached: number, checkExpiresAt: number}>): void {
        GM_setValue(HH_UNIVERSE+'LeaguePlayerRecord', data);
    }
    static getLeaguePlayerRecord(): Array<{bestPlace: number, timesReached: number, checkExpiresAt: number}> {
        return GM_getValue(HH_UNIVERSE+'LeaguePlayerRecord', {});
    }
}

export class StorageHandlerEventInfo {
    static setSMShopRefreshTimeComparedToServerTS(ts: number): void { // gives like timeout + server_now_ts
        GM_setValue(HH_UNIVERSE+'SMShopRefreshTime', ts);
    }
    static getSMShopRefreshTimeComparedToServerTS(): number {
        return GM_getValue(HH_UNIVERSE+'SMShopRefreshTime', 0);
    }
    static setPoVEndTimeComparedToServerTS(ts: number): void { // gives like end_time + server_now_ts
        GM_setValue(HH_UNIVERSE+'PoVEndTime', ts);
    }
    static getPoVEndTimeComparedToServerTS(): number {
        return GM_getValue(HH_UNIVERSE+'PoVEndTime', 0);
    }
    static setPoGEndTimeComparedToServerTS(ts: number): void { // gives like end_time + server_now_ts
        GM_setValue(HH_UNIVERSE+'PoGEndTime', ts);
    }
    static getPoGEndTimeComparedToServerTS(): number {
        return GM_getValue(HH_UNIVERSE+'PoGEndTime', 0);
    }
}