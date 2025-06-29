let globalTriggerTaskPreview: ((thought: string) => void) | null = null;

export const registerTaskPreviewTrigger = (trigger: (thought: string) => void) => {
  console.log('Registering task preview trigger:', !!trigger);
  globalTriggerTaskPreview = trigger;
  console.log('Task preview trigger registered successfully');
};

export const triggerTaskPreview = (thought: string) => {
  console.log('triggerTaskPreview called with:', thought);
  console.log('globalTriggerTaskPreview exists:', !!globalTriggerTaskPreview);
  
  if (globalTriggerTaskPreview) {
    console.log('Calling globalTriggerTaskPreview');
    globalTriggerTaskPreview(thought);
    console.log('globalTriggerTaskPreview called successfully');
  } else {
    console.warn('TaskPreview trigger not registered. Make sure AppLayout is rendered.');
    console.warn('Current trigger state:', globalTriggerTaskPreview);
  }
};

export const unregisterTaskPreviewTrigger = () => {
  globalTriggerTaskPreview = null;
}; 