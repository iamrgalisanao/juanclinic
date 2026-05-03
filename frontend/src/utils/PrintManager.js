/**
 * Clinical Print Manager
 * Ported to JuanClinic HIS for high-fidelity document isolation.
 */

export const printIsolatedDocument = async (htmlContent, title = 'Clinical Document', pageSize = 'A4') => {
    // 1. Create a truly hidden iframe
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '100%';
    iframe.style.bottom = '100%';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = 'none';
    iframe.title = title;
    
    document.body.appendChild(iframe);
    
    const doc = iframe.contentWindow.document;
    
    // 2. Inject all current application styles for Tailwind support
    const styles = Array.from(document.querySelectorAll('link[rel="stylesheet"], style'));
    const stylesHtml = styles.map(s => s.outerHTML).join('\n');
    
    // Page Dimensions
    const isA5 = pageSize.toUpperCase() === 'A5';
    const width = isA5 ? '148mm' : '210mm';
    const height = isA5 ? '210mm' : '297mm';

    // 3. Build the isolated HTML shell
    const fullHtml = `
        <!DOCTYPE html>
        <html>
            <head>
                <title>${title}</title>
                ${stylesHtml}
                <style>
                    @page { 
                        size: ${pageSize}; 
                        margin: 0; 
                    }
                    body { 
                        margin: 0; 
                        padding: 0;
                        background: white !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Strict Font Size for A5 */
                    ${isA5 ? `
                    * { 
                        font-size: 10pt !important; 
                        line-height: normal !important;
                        -webkit-print-color-adjust: exact !important;
                    }
                    ` : ''}
                    /* Ensure no other page content leaks */
                    #print-root {
                        width: ${width};
                        margin: 0 auto;
                        max-height: ${height};
                        overflow: hidden;
                        background: white !important;
                    }
                </style>
            </head>
            <body>
                <div id="print-root">
                    ${htmlContent}
                </div>
            </body>
        </html>
    `;
    
    doc.open();
    doc.write(fullHtml);
    doc.close();
    
    // 4. Wait for styles and images to load
    await new Promise(resolve => {
        iframe.contentWindow.onload = () => {
            // Slower delay for image rendering safety
            setTimeout(resolve, 500); 
        };
        // Fallback for immediate readiness
        if (doc.readyState === 'complete') {
            setTimeout(resolve, 500);
        }
    });
    
    // 5. Trigger native print
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
    
    // 6. Cleanup
    setTimeout(() => {
        document.body.removeChild(iframe);
    }, 1000);
};
