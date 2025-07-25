
const defaultCopyDelimiters = {
    inline: ['$', '$'],
    display: ['$$', '$$'],
};

function katexReplaceWithTex(
    fragment,
    copyDelimiters = defaultCopyDelimiters
) {
    const katexHtml = fragment.querySelectorAll('.katex-mathml + .katex-html');
    for (let i = 0; i < katexHtml.length; i++) {
        const element = katexHtml[i];
        if (element.remove) {
            element.remove();
        } else if (element.parentNode) {
            element.parentNode.removeChild(element);
        }
    }

    const katexMathml = fragment.querySelectorAll('.katex-mathml');
    for (let i = 0; i < katexMathml.length; i++) {
        const element = katexMathml[i];
        const texSource = element.querySelector('annotation');
        if (texSource) {
            if (element.replaceWith) {
                element.replaceWith(texSource);
            } else if (element.parentNode) {
                element.parentNode.replaceChild(texSource, element);
            }
            texSource.innerHTML = copyDelimiters.inline[0] +
                texSource.innerHTML + copyDelimiters.inline[1];
        }
    }

    const displays = fragment.querySelectorAll('.katex-display annotation');
    for (let i = 0; i < displays.length; i++) {
        const element = displays[i];
        element.innerHTML = copyDelimiters.display[0] +
            element.innerHTML.substr(copyDelimiters.inline[0].length,
                element.innerHTML.length - copyDelimiters.inline[0].length
                - copyDelimiters.inline[1].length)
            + copyDelimiters.display[1];
    }
    return fragment;
}

function closestKatex(node) {
    const element =
        (node instanceof Element ? node : node.parentElement);
    return element && element.closest('.katex');
}

document.addEventListener('copy', function (event) {
    const selection = window.getSelection();
    if (selection.isCollapsed || !event.clipboardData) {
        return;
    }
    const clipboardData = event.clipboardData;
    const range = selection.getRangeAt(0);

    const startKatex = closestKatex(range.startContainer);
    if (startKatex) {
        range.setStartBefore(startKatex);
    }

    const endKatex = closestKatex(range.endContainer);
    if (endKatex) {
        range.setEndAfter(endKatex);
    }

    const fragment = range.cloneContents();
    if (!fragment.querySelector('.katex-mathml')) {
        return;
    }

    const htmlContents = Array.prototype.map.call(fragment.childNodes,
        (el) => (el instanceof Text ? el.textContent : el.outerHTML)
    ).join('');

    const raw = katexReplaceWithTex(fragment).textContent;

    clipboardData.setData('text/html', htmlContents);
    clipboardData.setData('text/plain', raw);
    console.log(raw);
    event.preventDefault();
});

console.log('[copy-tex-portable] loaded');
