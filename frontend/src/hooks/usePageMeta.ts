import { useEffect } from 'react';

interface PageMetaOptions {
  title: string;
  description?: string;
}

export const usePageMeta = ({ title, description }: PageMetaOptions): void => {
  useEffect(() => {
    const originalTitle = document.title;
    document.title = title;

    if (description) {
      let metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
      }
      metaDesc.content = description;
    }

    return () => {
      document.title = originalTitle;
    };
  }, [title, description]);
};
