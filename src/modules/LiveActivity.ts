import { NativeModules, Platform } from 'react-native';

interface LiveActivityResponse {
  success: boolean;
  message: string;
}

interface ActivityStatusResponse {
  isActive: boolean;
}

interface LiveActivityModule {
  startLiveActivity(title: string, progress: number): Promise<LiveActivityResponse>;
  updateLiveActivity(progress: number, title?: string, status?: string): Promise<LiveActivityResponse>;
  endLiveActivity(): Promise<LiveActivityResponse>;
  isActivityActive(): Promise<ActivityStatusResponse>;
}

const { RNLiveActivity } = NativeModules;

class LiveActivity {
  private static instance: LiveActivity;

  public static getInstance(): LiveActivity {
    if (!LiveActivity.instance) {
      LiveActivity.instance = new LiveActivity();
    }
    return LiveActivity.instance;
  }

  /**
   * Check if Live Activities are supported on this device
   */
  public isSupported(): boolean {
    return Platform.OS === 'ios' && Platform.Version >= '16.1' && RNLiveActivity !== undefined;
  }

  /**
   * Start a new Live Activity
   * @param title - The title to display
   * @param progress - Initial progress (0.0 to 1.0)
   */
  public async startLiveActivity(title: string, progress: number = 0): Promise<LiveActivityResponse> {
    if (!this.isSupported()) {
      throw new Error('Live Activities are not supported on this device');
    }

    if (progress < 0 || progress > 1) {
      throw new Error('Progress must be between 0 and 1');
    }

    try {
      const result = await RNLiveActivity.startLiveActivity(title, progress);
      return result;
    } catch (error) {
      console.error('Failed to start Live Activity:', error);
      throw error;
    }
  }

  /**
   * Update the current Live Activity
   * @param progress - New progress value (0.0 to 1.0)
   * @param title - Optional new title
   * @param status - Optional new status
   */
  public async updateLiveActivity(
    progress: number, 
    title?: string, 
    status?: string
  ): Promise<LiveActivityResponse> {
    if (!this.isSupported()) {
      throw new Error('Live Activities are not supported on this device');
    }

    if (progress < 0 || progress > 1) {
      throw new Error('Progress must be between 0 and 1');
    }

    try {
      const result = await RNLiveActivity.updateLiveActivity(progress, title, status);
      return result;
    } catch (error) {
      console.error('Failed to update Live Activity:', error);
      throw error;
    }
  }

  /**
   * End the current Live Activity
   */
  public async endLiveActivity(): Promise<LiveActivityResponse> {
    if (!this.isSupported()) {
      throw new Error('Live Activities are not supported on this device');
    }

    try {
      const result = await RNLiveActivity.endLiveActivity();
      return result;
    } catch (error) {
      console.error('Failed to end Live Activity:', error);
      throw error;
    }
  }

  /**
   * Check if there's an active Live Activity
   */
  public async isActivityActive(): Promise<boolean> {
    if (!this.isSupported()) {
      return false;
    }

    try {
      const result = await RNLiveActivity.isActivityActive();
      return result.isActive;
    } catch (error) {
      console.error('Failed to check Live Activity status:', error);
      return false;
    }
  }
}

export default LiveActivity.getInstance();
export { LiveActivityResponse, ActivityStatusResponse }; 