import React from 'react';

const PasteBox = (props) => {

    //------------------------------------------------------------------------------

    //
    const tagWhitelist       = ['h1', 'h2', 'h3', 'h3', 'h5', 'h6', 'a', 'b', 'i', 'p', 'sup', 'sub', 'ul', 'ol', 'li', 'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td'];
    const attributeWhitelist = ['href'];

    //define some common html entities - warning, these get applied to the html string, and will encode attributes and tags indiscriminately
    const encodeEntities = {
        '‘' : '&lsquo;',
        '’' : '&rsquo;',
        '“' : '&ldquo;',
        '”' : '&rdquo;',
        '–' : '&ndash;',
        '—' : '&mdash;',
        '…' : '&hellip;',
        '™' : '&trade;',
        '£' : '&pound;',
        '€' : '&euro;',
        '©' : '&copy;',
        '®' : '&reg;',
        '°' : '&deg;',
        '¼' : '&frac14;',
        '½' : '&frac12;',
        '¾' : '&frac34;',
    };

    //------------------------------------------------------------------------------

    //convert the string into a html fragment we can use dom manipulation methods on
    const pasteFragment = new DOMParser().parseFromString(props.content, "text/html");
    const pasteFragmentBody = pasteFragment.querySelector('body');

    //------------------------------------------------------------------------------

    //take care of any in-page anchor tags - 'a' tags are otherwise allowed
    pasteFragmentBody.querySelectorAll('a[name]').forEach(function(element) {
        removeTag(element);
    });

    //remove any non whitelisted tags
    pasteFragmentBody.querySelectorAll('*').forEach(function(element) {
        if (!tagWhitelist.includes(element.tagName.toLowerCase())) {
            removeTag(element);
        }
    });

    //remove any attributes that have not been whitlisted
    pasteFragmentBody.querySelectorAll('*').forEach(function(element) {
        if (element.hasAttributes()) {
            for (let i = element.attributes.length - 1; i >= 0; i--) {
                if (!attributeWhitelist.includes(element.attributes[i].name)) {
                    element.removeAttribute(element.attributes[i].name);
                }
            }
        }
    });

    //remove the paragraph tags from table cells, unless there is more than one in the cell
    pasteFragmentBody.querySelectorAll('td, th').forEach(function(element) {
        if (element.querySelectorAll('p').length === 1) {
            removeTag(element.querySelector('p'));
        }
    });

    //------------------------------------------------------------------------------

    //convert the html back into a string so we can apply some final tidies to it
    let pasteString = pasteFragmentBody.innerHTML;

    //remove any html comments - this will strip out CDATA etc
    pasteString = pasteString.replace(/<!--[\s\S]*?-->/g, '');

    //convert html entities into their encoded form
    Object.keys(encodeEntities).forEach(function(entity) {
        pasteString = pasteString.replace(new RegExp(entity, 'g'), encodeEntities[entity]);
    });

    //convert any non-breaking spaces into a real space
    pasteString = pasteString.replace(/&nbsp;/g, ' ');

    //tidy up the whitespace, removes repeated spaces and trims whitespace between tags
    pasteString = pasteString.replace(/\s+/g, ' ').replace(/>\s+</g, function(match) {
        return match.trim();
    });

    //now remove the whitespace at the beginning and end of paragraphs, headings and table cells
    pasteString = pasteString.replace(/(<p>|<h[1-6]>|<th>|<td>)\s+/g, '$1');
    pasteString = pasteString.replace(/\s+(<\/p>|<\/h[1-6]>|<\/th>|<\/td>)/g, '$1');

    //remove any "empty" tags (just whitespace can be considered to be empty) - what about empty table cells - fuuuuuuuu
    const emptyTagsRegex = new RegExp('<[^\/>][^>]*>\s*?<\/[^>]+>', 'g');
    while (emptyTagsRegex.test(pasteString)) {
        pasteString = pasteString.replace(/<[^\/>][^>]*>\s*?<\/[^>]+>/g, '');
    }

    //start with some list fixes, convert all the "list like" paragraphs with it's own list - does not support nested lists
    pasteString = pasteString.replace(/<p>(?:·|•) (.+?)<\/p>/g, '<ul><li>$1</li></ul>');
    pasteString = pasteString.replace(/<p>[0-9]+\. (.+?)<\/p>/g, '<ol><li>$1</li></ol>');

    // //now merge all the lists we just created
    pasteString = pasteString.replace(/<\/ul>\s+?<ul>/g, '');
    pasteString = pasteString.replace(/<\/ol>\s+?<ol>/g, '');

    //headings have a clear line above them, paragraphs are on a new line
    pasteString = pasteString.replace(/<h[2-6]>/g, '\n\n$&');
    pasteString = pasteString.replace(/<p>/g, '\n$&');

    //lists are on their own line, the list elements are indented
    pasteString = pasteString.replace(/<ul>|<\/ul>|<ol>|<\/ol>/g, '\n$&');
    pasteString = pasteString.replace(/<li>/g, '\n    $&');

    //lists are on their own line, the list elements are indented
    pasteString = pasteString.replace(/<table>|<\/table>/g, '\n$&');
    pasteString = pasteString.replace(/<tbody>|<\/tbody>/g, '\n    $&');
    pasteString = pasteString.replace(/<tr>|<\/tr>/g,       '\n        $&');
    pasteString = pasteString.replace(/<td>/g,              '\n            $&');

    //handle the table cells with multiple lines in them - ideally the paragrpaths should also be indented, but this is non trivial with regex
    pasteString = pasteString.replace(/(<\/p>)(<\/td>)/g,   '$1\n            $2');

    //apply some further operations, e.g. adding custom classes to lists
    pasteString = pasteString.replace(/<ul>/g, '<ul class="list">');
    pasteString = pasteString.replace(/<ol>/g, '<ol class="list">');

    //and adding some default attributes to tables
    pasteString = pasteString.replace(/<table>/g, '<table border="0" cellspacing="0" cellpadding="0" width="100%">');

    //do a final trim on the string
    pasteString = pasteString.trim();

    //------------------------------------------------------------------------------
    
    //function to pass the formatted paste to clipboard
    const copyToClipboard = function() {

        //create a textarea
        const fakeTextarea = document.createElement('textarea');

        //store your string in the textarea
        fakeTextarea.innerHTML = pasteString;

        //add the textarea to the body and then select the contents of the textarea and simulate a copy command (ctrl-c)
        document.querySelector('body').appendChild(fakeTextarea);
        fakeTextarea.select(); document.execCommand('copy');

        //now get rid of the textarea element
        document.querySelector('body').removeChild(fakeTextarea);

    };

    //------------------------------------------------------------------------------

    //
    return (
        <div className="pastebox" onPaste={props.onPaste}>
            
            <div className="markup">
                <button className="btn btn-primary" onClick={copyToClipboard}>Copy</button>
                <div>{pasteString}</div>
            </div>
            <div className="preview" dangerouslySetInnerHTML={{ __html: pasteString }}></div>
        </div>
    );

    //------------------------------------------------------------------------------

}

//
function removeTag(element) {
    const parentElement = element.parentNode;
    while (element.firstChild) {
        parentElement.insertBefore(element.firstChild, element);
    }
    parentElement.removeChild(element);
}

export default PasteBox;
