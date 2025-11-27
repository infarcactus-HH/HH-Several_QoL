export abstract class AlwaysRunningModule {
    protected hasRun = false;
    abstract run(): void;
}