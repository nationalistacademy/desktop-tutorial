const fs = require('fs');

function replaceSections(sourceTheme, sourceGadgets, output) {
    let themeContent = fs.readFileSync(sourceTheme, 'utf-8');
    const gadgetsContent = fs.readFileSync(sourceGadgets, 'utf-8');

    // Blogger sections cannot be nested. So we can match them with a simple regex.
    // However, they can contain newlines, so we use [\s\S]*?
    const sectionRegex = /<b:section\s+[^>]*id=['"]([^'"]+)['"][^>]*>[\s\S]*?<\/b:section>/gi;

    const gadgetSections = {};
    let match;
    while ((match = sectionRegex.exec(gadgetsContent)) !== null) {
        gadgetSections[match[1]] = match[0];
    }

    // Now replace in themeContent
    let newContent = themeContent.replace(sectionRegex, (match, id) => {
        if (gadgetSections[id]) {
            return gadgetSections[id];
        }
        return match; // Keep original if not found (shouldn't happen based on our previous check)
    });

    fs.writeFileSync(output, newContent, 'utf-8');
    console.log(`Saved to ${output}`);
}

replaceSections('taleemwaly.xml', 'assignmentwaly.xml', 'assignmentwaly_merged.xml');
