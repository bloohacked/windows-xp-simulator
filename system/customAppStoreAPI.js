//custom app store api
//usage, the apps will be automatically added to the start menu and the applications list upon boot
//use installApp(string name, string icon url, string code) to install an app

xp.filesystem.createDir("/Program Icons", () => {}); 

$(window).on('xpboot', () => {
	refreshApps();
});

function refreshApps() {
	xp.filesystem.listDir('/Program Files', (name) => {
		if (name.charAt(name.length - 1) !== '/') {
			refreshApp(xp.filesystem.basename(name), "/Program Icons/" + xp.filesystem.basename(name).replace('.js', '.txt'));
		}
	});
}

function refreshApp(name, iconPath) {
	var appName = name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").replace(/\s{2,}/g, " ").replace(/ /g, "-");
	xp.applications.add(appName, (args) => {
		if (args == undefined || args.length === 0)
			args = ['/Program Files', name + '.js'];
		loadApp(name, args);
	});
	xp.filesystem.readFile(iconPath, function(e) {
		xp.startmenu.add(appName, name, e);
	});
}

function installApp(name, icon, code) {
	var iconPath = '/Program Icons/' + name + '.txt';
	xp.filesystem.writeFile(iconPath, new Blob([icon], { type: 'text/plain' }), (e) => {
		if (e) {
			xp.dialog('Error', e);
		} else {
			xp.filesystem.writeFile('/Program Files/' + name + '.js', new Blob([code], { type: 'text/plain' }), (e) => {
				if (e) {
					xp.dialog('Error', e);
				} else {
					refreshApp(name, iconPath);
				}
			});
		}
	});
}
