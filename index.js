const google = require('googleapis');
const OAuth2 = google.auth.OAuth2;

module.exports = moveFiles;

function moveFiles(data = {}) {
  var oauth2Client = new OAuth2();

  oauth2Client.setCredentials({
    access_token: data.token,
  });

  var drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });

  drive.files.list({
    pageSize: data.limit ? data.limit : 100,
    orderBy: 'modifiedByMeTime',
    q: `name contains '${data.name}' and mimeType contains 'video' and '${data.owner}' in owners`
  }, function (err, resp) {
    if(err) console.log(err.message);

    console.log(`found ${resp.files.length} files`);
    var offset = 0;
    resp.files.forEach(function(file){
      setTimeout(function(){
        drive.permissions.create({
          fileId: file.id,
          transferOwnership: true,
          resource: {
            role: 'owner',
            type: 'user',
            emailAddress: data.target,
          }
        }, (err, done) => {
          if(err) {
            if(/Anda tak dapat membagikan/.test(err.message)) {
              var drive2 = google.drive({
                version: 'v2',
                auth: oauth2Client,
              });
              drive2.files.trash({
                fileId: file.id
              }, (err, done) => {
                if(err) console.log(file.id + ': ' + err.message);
                else console.log(file.id + ': Deleted');
              })
            } else {
              console.log(file.id + ': ' + err.message);
            }
          }
          else console.log(file.id + ': Changed');
        })
      }, data.interval ? data.interval : 100 + offset);
     offset += data.interval ? data.interval : 100;
    });
    // resp.files.map((file) => {
    //   drive.permissions.create({
    //     fileId: file.id,
    //     transferOwnership: true,
    //     resource: {
    //       role: 'owner',
    //       type: 'user',
    //       emailAddress: data.target,
    //     }
    //   }, (err, done) => {
    //     if(err) {
    //       if(/Anda tak dapat membagikan/.test(err.message)) {
    //         var drive2 = google.drive({
    //           version: 'v2',
    //           auth: oauth2Client,
    //         });
    //         drive2.files.trash({
    //           fileId: file.id
    //         }, (err, done) => {
    //           if(err) console.log(file.id + ': ' + err.message);
    //           else console.log(file.id + ': Deleted');
    //         })
    //       } else {
    //         console.log(file.id + ': ' + err.message);
    //       }
    //     }
    //     else console.log(file.id + ': Changed');
    //   })
    // })
  });
}
