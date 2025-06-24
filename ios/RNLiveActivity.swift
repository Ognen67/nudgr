import Foundation
import React

@objc(RNLiveActivity)
class RNLiveActivity: NSObject {
  
  @objc
  static func requiresMainQueueSetup() -> Bool {
    return true
  }
  
  @objc
  func startLiveActivity(_ title: String, progress: NSNumber, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      let success = LiveActivityManager.shared.startLiveActivity(
        title: title,
        progress: progress.doubleValue
      )
      
      if success {
        resolver(["success": true, "message": "Live Activity started"])
      } else {
        rejecter("START_FAILED", "Failed to start Live Activity", nil)
      }
    } else {
      rejecter("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
    }
  }
  
  @objc
  func updateLiveActivity(_ progress: NSNumber, title: String?, status: String?, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      let success = LiveActivityManager.shared.updateLiveActivity(
        progress: progress.doubleValue,
        title: title,
        status: status
      )
      
      if success {
        resolver(["success": true, "message": "Live Activity updated"])
      } else {
        rejecter("UPDATE_FAILED", "Failed to update Live Activity", nil)
      }
    } else {
      rejecter("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
    }
  }
  
  @objc
  func endLiveActivity(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      let success = LiveActivityManager.shared.endLiveActivity()
      
      if success {
        resolver(["success": true, "message": "Live Activity ended"])
      } else {
        rejecter("END_FAILED", "Failed to end Live Activity", nil)
      }
    } else {
      rejecter("UNSUPPORTED", "Live Activities require iOS 16.1 or later", nil)
    }
  }
  
  @objc
  func isActivityActive(_ resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    if #available(iOS 16.1, *) {
      let isActive = LiveActivityManager.shared.isActivityActive()
      resolver(["isActive": isActive])
    } else {
      resolver(["isActive": false])
    }
  }
} 