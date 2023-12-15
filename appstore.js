var installedApps = {};

function updateInstalledApps() {
  xp.filesystem.listDir('/Program Files', (name) => {
    if (name.charAt(name.length - 1) !== '/') {
      updateInstalledApp(xp.filesystem.basename(name));
    }
  });
}

$(window).on('xpboot', () => {
  updateInstalledApps();
});

function updateInstalledApp(name) {
  var appName = name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").replace(/ /g,"-");
  xp.applications.add(appName, (args) => {
    if (args == undefined || args.length === 0)
      args = ['/Program Files', name + '.js'];
    loadApp(name, args);
  });
  xp.startmenu.add(appName, name, 'https://xdstore.glitch.me/appicon?app=' + name);
}

function XDinstallApp(name) {
  $.ajax({
    url: '//xdstore.glitch.me/appcode?app=' + encodeURIComponent(name),
    async: true,
    success: (text) => {
      xp.filesystem.writeFile('/Program Files/' + name + '.js', new Blob([text], {type: 'text/plain'}), (e) => {
        if (e) {
          xp.dialog('Error', e);
        } else {
          updateInstalledApp(name);
          setTimeout(() => {
            $('.xdstore_iframe').each(function() {
              this.contentWindow.postMessage('reload', '*');
              setTimeout(() => this.contentWindow.postMessage('native', '*'), 2000);
            })
          }, 1000);
        }
      });
    }
  });
}

function XDremoveApp(name, callback) {
  xp.dialog('Confirm', 'Are you sure you want to uninstall ' + name + '?', () => {
    xp.filesystem.deleteFile(xp.filesystem.addPaths('/Program Files', name + '.js'), (e) => {
      if (e) {
        xp.dialog('Error', e);
      } else {
        var appname = name.toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g,"").replace(/\s{2,}/g," ").replace(/ /g,"-");
        xp.applications.remove(appname);
        xp.startmenu.remove(appname);
        $('.xdstore_iframe').each(function() {
          this.contentWindow.postMessage('reload', '*');
          setTimeout(() => this.contentWindow.postMessage('native', '*'), 2000);
        });
        if (callback !== undefined) callback();
      }
    });
  }, true);
}

$(window).on('xpboot', () => {
  xp.controlpanel.add('Add and Remove Programs', () => {
    var el = $.parseHTML(`<window title="Add and Remove Programs" width="500" height="400">
  <ul class="menu">
  </ul>
</window>`);
    document.body.append(el[0]);
    $(el).updateWindow();

    $(el).on('click', function() {
      $(this).find('li').each(function() {
        $(this).attr('data-selected', 'false');
        $(this).find('div').css('display', 'none');
        $(this).css('height', '18px');
      });
    });

    function listDir(el) {
      $(el).find('ul').html('');
      xp.filesystem.listDir('/Program Files', (name) => {
        if (name.charAt(name.length - 1) !== '/') {
          var el2 = $.parseHTML(`<li class="menuitem" data-selected="false" style="padding-right:4px;">
      ` + xp.filesystem.basename(name) + `
      <div style="display:none;"><button style="float:right;">Remove</button></div>
    </li>`);
          $(el2).on('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            $(el).find('li').each(function() {
              $(this).attr('data-selected', 'false');
              $(this).find('div').css('display', 'none');
              $(this).css('height', '18px');
            });
            $(this).attr('data-selected', 'true');
            $(this).find('div').css('display', 'block');
            $(this).css('height', '38px');
          });
          $(el2).find('button').on('click', function() {
            XDremoveApp(xp.filesystem.basename(name), () => listDir(el));
          });
          $(el).find('ul').append(el2);
        }
      });
    }

    listDir(el);
  });
  xp.applications.add('xdstore', () => {
    var el = $.parseHTML(`<window width="837" height="425" title="App Store">
      <style>
    iframe[seamless]{
      background-color: transparent;
      border: 0px none transparent;
      padding: 0px;
      overflow: hidden;
    }
    .frame-container {
      position: absolute;
      width: 100%;
      height: 100%;
      overflow: hidden;
      padding: 0px;
      margin: 0px;
    }
      </style>
      <div class="frame-container">
        <iframe height="100%" seamless="seamless" width="100%" src="//xdstore.glitch.me/" class="xdstore_iframe"></iframe>
      </div>
    </window>`);
    
    document.body.append(el[0]);
    $(el).updateWindow();
    
    $(el).find('iframe').on('load', function() {
      this.contentWindow.postMessage('native', '*');
    });
  });
  
  window.addEventListener('message', function(e) {
    var key = e.message ? 'message' : 'data';
    var data = e[key];
    console.log(data);
    if ((typeof data) === 'object' && data.length !== undefined && data.length === 2) {
      if (data[0] === 'XDinstallApp') {
        XDinstallApp(data[1]);
      } else if (data[0] === 'XDremoveApp') {
        XDremoveApp(data[1]);
      } else if (data[0] === 'isInstalled' && data[1] != undefined) {
        $('.xdstore_iframe').each(function() {
          xp.filesystem.listDir('/Program Files', (name) => {
            if (xp.filesystem.basename(name).toLowerCase() === data[1].toLowerCase()) {
              this.contentWindow.postMessage(['isInstalled', true], '*');
            }
          });
        });
      }
    }
  }, false);
  
});
