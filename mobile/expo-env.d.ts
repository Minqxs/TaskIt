declare namespace NodeJS {
  interface ProcessEnv {
    EXPO_PUBLIC_API_URL?: string;
  }

  interface Process {
    env: ProcessEnv;
  }
}

declare const process: NodeJS.Process;
