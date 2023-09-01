import { renderToStaticMarkup } from 'react-dom/server';

const onMissingTranslation = ({ defaultTranslation }) => defaultTranslation;

const initialize = {
  languages: [ 'pt', 'en' ],
  options: {
    defaultLanguage: 'pt',
    renderToStaticMarkup: renderToStaticMarkup,
    onMissingTranslation,
  }
};

export default initialize;
