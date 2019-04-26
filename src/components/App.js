import React, { useState } from 'react';

import Layout from './Layout';
import PasteBox from './PasteBox';

function App() {

    //
    const [paste, setPaste] = useState('<h1>Word to Web</h1><h2>Introduction</h2><p>Copy and Paste the word document here, this tool will then reformat the document and apply a number of fixes to the document.</p><h2>What does this tool fix?</h2><p>This tool main purpose is to convert invalid html entities such as quotation marks and other punctuation such as currency symbols.</p><p>In addition, it will format the html with sensible whitespace rules, and:</p><ul class="list"><li>Remove any trailing whitespace after paragraphs and headings</li><li>Convert both ordered and unordered lists into html lists</li><li>Remove empty elements, invalid tags and attributes</li></ul><p>The goal here is to provide a sensible base to start adding any additional styling and elements.</p><h2>What does this tool not fix?</h2><p>Currently nested lists are unsupported, as are images. Any highlighting will be lost and you should review the output before use.</p><h2>What can I do to make this better?</h2><p>When creating the document, use the built-in heading styles where possible, as these will allow the correct heading tags to be used.</p><p>Also, be sure to accept any revisions &ndash; as the final document will contain both the before and after revisions.</p>');

    //pass the pasted html into state, this will cause the pastebox to re-render
    const onPaste = (event) => {
        event.preventDefault();
        if (event.clipboardData) {
            setPaste(event.clipboardData.getData('text/html'));
        }
    };

    return (
        <Layout title="Word to Web">
            <PasteBox onPaste={onPaste} content={paste} />
        </Layout>
    );

}

export default App;
