export interface FrontendResponse {
  buildTime: string;
  git: {
    commit: string;
    shortCommit: string;
    branch: string;
    tag: string;
    message: string;
    date: string;
  };
  environment: {
    nodeVersion: string;
  };
}
