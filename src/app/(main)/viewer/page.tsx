// pages/viewer.js
export default function ViewerPage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <iframe
        src="http://localhost:3000/t-chaii?StudyInstanceUIDs=1.3.51.0.1.1.172.19.3.128.3268319.3268258"
        className="h-full w-full border-none"
        title="OHIF Viewer"
      ></iframe>
    </div>
  );
}
