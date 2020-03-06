const { registerFont, createCanvas } = require('canvas');
const fs = require('fs');
const utils = require('./utils');
const colors = require('./colors');

const fontSize = 18;
const padding = fontSize + 2;
const rowHeight = fontSize * 2.2;
const fontY = (rowHeight + fontSize / 1.5) / 2;

registerFont('./cs/tables/fonts/OpenSans-Regular.ttf', { family: "Open Sans" });
registerFont('./cs/tables/fonts/OpenSans-Bold.ttf', { family: "Open Sans", weight: "bold" });

const fontFace = `Open Sans`;
const bold = `bold ${fontSize}px "${fontFace}"`;
const normal = `normal ${fontSize}px "${fontFace}"`;

const icons = utils.fileList('./cs/tables/icons/');

function getColor(column, text, theme, multi=0, total=false) {
    if (multi > 0) return colors[theme].grey;
    if (total) return colors[theme].total;

    if (column == 'init') {
        return utils.timeColor(text, colors[theme]) || colors[theme].normal;
    }
    if (column == 'change') {
        return (text.indexOf('+') != -1)
            ? colors[theme].green
            : colors[theme].red;
    }
    if (column == 'type') {
        return (text.indexOf('BUY') != -1)
            ? colors[theme].green
            : colors[theme].red;
    }

    return colors[theme].normal;
}

function drawHeaders(ctx, data, headers, theme) {
    var x = 0;

    for (var i = 0; i < headers.length; i++){
        const text = headers[i];
        const width = utils.maxColumnWidth(ctx, data, headers, i, padding, bold);

        utils.drawRect(ctx, x, 0, width, rowHeight, colors[theme].headerBg);
        utils.drawText(ctx, text, x, fontY, width, padding, colors[theme].header, true);

        x += width;
    }
}

function drawRows(ctx, data, headers, theme) {
    var x = 0;
    var y = rowHeight;

    for (var row = 0; row < data.length; row++){
        const lines = utils.rowLineCount(data[row]);
        const height = (lines - 1) * fontY + rowHeight;
        const _y = y + fontY;
        x = 0;

        var idx = 0;
        var rectColor = colors[theme].bg;
        var firstCol = true;
        for (const col in data[row]){
            var text = data[row][col].toString();
            var font = firstCol ? bold : normal;
            var offset = 0;
            const isTotal = utils.isTotalLine(data, row);

            if (isTotal) {
                font = bold;
                rectColor = colors[theme].totalBg;
            }

            if (col == 'type') {
                font = bold;
            }

            const width = utils.maxColumnWidth(ctx, data, headers, idx, padding, font);

            utils.drawRect(ctx, x, y, width, height, rectColor);

            if (col == 'coin') {
                const icon = utils.getIcon(icons, text);
                if (icon != '') {
                    utils.drawIcon(ctx, icon, x, y, width, fontSize);
                    offset = fontY;
                }
            }

            const multi = text.split('\n');
            for (var m = 0; m < multi.length; m++) {
                const color = getColor(col, multi[m], theme, m, isTotal);
                const ty = y + fontY + fontY * m + offset;
                utils.drawText(ctx, multi[m], x, ty, width, padding, color, firstCol || col == 'type');
            }

            idx++;
            x += width;
            firstCol = false;
        }

        y += height;
    }
}

exports.genTable = function(data, headers, theme, filename) {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');
    const [width, height] = utils.calcSize(ctx, data, headers, rowHeight, padding, fontY, normal);

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = colors[theme].bg;
    ctx.fillRect(0, 0, width, height);

    drawHeaders(ctx, data, headers, theme);
    drawRows(ctx, data, headers, theme);

    ctx.strokeStyle = colors[theme].stroke;
    ctx.lineWidth = 0.2;
    ctx.stroke();

    return canvas.createJPEGStream({
        bufsize: 2048,
        quality: 80
    });
};
