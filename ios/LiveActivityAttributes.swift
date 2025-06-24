import ActivityKit
import Foundation

struct LiveActivityAttributes: ActivityAttributes {
    public struct ContentState: Codable, Hashable {
        // Dynamic stateful properties about your activity go here!
        var title: String
        var progress: Double
        var status: String
        var timestamp: Date
    }

    // Fixed non-changing properties about your activity go here!
    var name: String
    var activityType: String
} 