import { useEffect } from 'react';

const Seo = ({ title, description, image, url, children }) => {
  useEffect(() => {
    if (title) document.title = title;

    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = 'description';
        document.head.appendChild(meta);
      }
      meta.content = description;
    }

    if (image) {
      let metaImage = document.querySelector('meta[property="og:image"]');
      if (!metaImage) {
        metaImage = document.createElement('meta');
        metaImage.setAttribute('property', 'og:image');
        document.head.appendChild(metaImage);
      }
      metaImage.content = image;
    }

    if (url) {
      let metaUrl = document.querySelector('meta[property="og:url"]');
      if (!metaUrl) {
        metaUrl = document.createElement('meta');
        metaUrl.setAttribute('property', 'og:url');
        document.head.appendChild(metaUrl);
      }
      metaUrl.content = url;
    }
  }, [title, description, image, url]);

  // Return children so the component is a valid React element if needed
  return null;
};

export default Seo;
