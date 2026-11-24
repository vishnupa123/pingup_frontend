const isCloudinaryUrl = (url) => {
  try {
    return new URL(url).hostname.endsWith('cloudinary.com');
  } catch {
    return false;
  }
};

const withCloudinaryAttachment = (url) => {
  try {
    const parsed = new URL(url);
    if (!parsed.hostname.endsWith('cloudinary.com')) return url;

    // Cloudinary's fl_attachment flag forces a download instead of playback.
    parsed.pathname = parsed.pathname.replace('/upload/', '/upload/fl_attachment:pingup-video/');
    return parsed.toString();
  } catch {
    return url;
  }
};

export const downloadVideo = async (url, filename = 'pingup-video') => {
  if (!url) return;

  const attachmentUrl = withCloudinaryAttachment(url);

  if (isCloudinaryUrl(url)) {
    const link = document.createElement('a');
    link.href = attachmentUrl;
    link.download = filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
    return;
  }

  try {
    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) throw new Error(`Download failed: ${response.status}`);

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  } catch (error) {
    console.error('Error downloading video:', error);
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
