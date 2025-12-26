const style = {
    body: `
        font-family: Arial, sans-serif;
        background-color: #004428ff;
        color: #ffffff;
        padding: 20px;
        width: 100%;
        box-sizing: border-box;
        margin: auto auto;
        max-width: 600px;
        border-radius: 8px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        text-align: center;
        justify-content: center;
    `,
    header: `
        font-size: 24px;
        font-weight: bold;
        margin-bottom: 10px;
        text-transform: uppercase;
        text-shadow: 1px 1px 2px #000000;
        text-align: center;
    `,
    footer: `
        font-size: 12px;
        color: #cccccc;
        margin-top: 20px;
        text-align: right;
    `,
    code: `
        font-family: 'Courier New', monospace;
        background-color: #222222;
        padding: 8px 14px;
        border-radius: 6px;
        color: #00ff00;
        display: block;
        width: max-content;
        margin: 12px auto;
        font-size: 18px;
        text-align: center;
    `,
    content: `
        font-size: 16px;
        line-height: 1.5;
        margin-bottom: 20px;
        text-align: left;
        justify-content: center;
    `,
    link: `
        color: #00ffff;
        text-decoration: none;
        text-shadow: 1px 1px 2px #000000;
    `,
};

export default function implementEmailStyle(htmlContent) {
    let updatedContent = htmlContent.replace('class="body"', `style="${style.body}"`);
    updatedContent = updatedContent.replace('class="header"', `style="${style.header}"`);
    updatedContent = updatedContent.replace('class="footer"', `style="${style.footer}"`);
    updatedContent = updatedContent.replace('class="code"', `style="${style.code}"`);
    updatedContent = updatedContent.replace('class="content"', `style="${style.content}"`);
    updatedContent = updatedContent.replace('class="link"', `style="${style.link}"`);
    return updatedContent;
}