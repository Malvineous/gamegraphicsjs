/**
 * @file Main library interface.
 *
 * Copyright (C) 2018-2019 Adam Nielsen <malvineous@shikadi.net>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

const fileTypes = [
	// These file formats all have signatures so the autodetection is
	// fast and they are listed first.
	require('./images/img-raw-8bpp-linear.js'),
	require('./images/img-png.js'),

	// These formats require enumeration, sometimes all the way to the
	// end of the file, so they are next.
	require('./palettes/pal-vga-6bit.js'),
	require('./palettes/pal-vga-8bit.js'),

	// These formats are so ambiguous that they are often misidentified,
	// so they are last.
	// Coming soon :)
];

/**
 * Main library interface.
 */
module.exports = class GameGraphics
{
	/**
	 * Get a handler by ID directly.
	 *
	 * @param {string} type
	 *   Identifier of desired file format.
	 *
	 * @return {ArchiveHandler} from formats/*.js matching requested code, or null
	 *   if the code is invalid.
	 *
	 * @example const handler = GameGraphics.getHandler('img-vga');
	 */
	static getHandler(type)
	{
		return fileTypes.find(x => type === x.metadata().id);
	}

	/**
	 * Get a handler by examining the file content.
	 *
	 * @param {Uint8Array} content
	 *   Archive file content.
	 *
	 * @return {Array} of {ArchiveHandler} from formats/*.js that can handle the
	 *   format, or an empty array if the format could not be identified.
	 *
	 * @example
	 * const content = fs.readFileSync('test.pcx');
	 * const handler = GameGraphics.findHandler(content);
	 * if (!handler) {
	 *   console.log('Unable to identify file format.');
	 * } else {
	 *   const md = handler.metadata();
	 *   console.log('File is in ' + md.id + ' format');
	 * }
	 */
	static findHandler(content)
	{
		let handlers = [];
		fileTypes.some(x => {
			const metadata = x.metadata();
			const confidence = x.identify(content);
			if (confidence === true) {
				handlers = [x];
				return true; // exit loop early
			}
			if (confidence === undefined) {
				handlers.push(x);
				// keep going to look for a better match
			}
		});
		return handlers;
	}

	/**
	 * Get a list of all the available handlers.
	 *
	 * This is probably only useful when testing the library.
	 *
	 * @return {Array} of file format handlers, with each element being just like
	 *   the return value of getHandler().
	 */
	static listHandlers() {
		return fileTypes;
	}
};

module.exports.Image = require('./images/image.js');
module.exports.Palette = require('./palettes/palette.js');
