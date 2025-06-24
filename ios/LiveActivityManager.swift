import ActivityKit
import Foundation

@available(iOS 16.1, *)
class LiveActivityManager {
    static let shared = LiveActivityManager()
    private var currentActivity: Activity<LiveActivityAttributes>?
    
    private init() {}
    
    func startLiveActivity(title: String, progress: Double) -> Bool {
        guard ActivityAuthorizationInfo().areActivitiesEnabled else {
            print("Live Activities are not enabled")
            return false
        }
        
        // End any existing activity first
        endLiveActivity()
        
        let attributes = LiveActivityAttributes(
            name: "Nudger Task",
            activityType: "task_progress"
        )
        
        let contentState = LiveActivityAttributes.ContentState(
            title: title,
            progress: max(0.0, min(1.0, progress)), // Clamp between 0 and 1
            status: "In Progress",
            timestamp: Date()
        )
        
        do {
            let activity = try Activity<LiveActivityAttributes>.request(
                attributes: attributes,
                contentState: contentState,
                pushType: nil
            )
            
            self.currentActivity = activity
            print("Live Activity started successfully with ID: \(activity.id)")
            return true
        } catch {
            print("Failed to start Live Activity: \(error)")
            return false
        }
    }
    
    func updateLiveActivity(progress: Double, title: String? = nil, status: String? = nil) -> Bool {
        guard let activity = currentActivity else {
            print("No active Live Activity to update")
            return false
        }
        
        let currentState = activity.contentState
        let newState = LiveActivityAttributes.ContentState(
            title: title ?? currentState.title,
            progress: max(0.0, min(1.0, progress)), // Clamp between 0 and 1
            status: status ?? currentState.status,
            timestamp: Date()
        )
        
        Task {
            do {
                await activity.update(using: newState)
                print("Live Activity updated successfully")
            } catch {
                print("Failed to update Live Activity: \(error)")
            }
        }
        
        return true
    }
    
    func endLiveActivity() -> Bool {
        guard let activity = currentActivity else {
            print("No active Live Activity to end")
            return false
        }
        
        let finalState = LiveActivityAttributes.ContentState(
            title: activity.contentState.title,
            progress: 1.0,
            status: "Completed",
            timestamp: Date()
        )
        
        Task {
            do {
                await activity.end(using: finalState, dismissalPolicy: .after(.now + 5))
                print("Live Activity ended successfully")
            } catch {
                print("Failed to end Live Activity: \(error)")
            }
        }
        
        self.currentActivity = nil
        return true
    }
    
    func isActivityActive() -> Bool {
        return currentActivity != nil
    }
    
    func getActivityId() -> String? {
        return currentActivity?.id
    }
} 