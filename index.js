const cheerio = require("cheerio");
const rp = require("request-promise");
const fs = require('fs')

rp(
    "https://www.scotusblog.com/case-files/terms/ot2022/"
)
  .then(res => {
    let links = cheerio.load(res);
    return links;
  })
  .then($ => {
    let titlesArr = []
    let linksArr = [];
    $(`td`)
      .find(`a`)
      .attr(`href`, (i, val) => {
        linksArr.push(val);
      });
    $(`a.case-title`).text((i, val) => {
      titlesArr.push([i, val])
    })
    // console.log(titlesArr)
    return linksArr;
  })
  .then(arr => {
    let final = arr.filter(url => {
      if (typeof url === "string") {
        return (
          url.substring(0, 43) ===
          "https://www.scotusblog.com/case-files/cases"
        );
      } else return false;
    });
    // console.log(final)
    return final;
  })
  .then(caseLinks => {
    let tempObj = {};
    let tempPetitioner = [];
    let tempRespondent = [];
    let tempName = "";
    caseLinks.forEach((url, index) => {
      tempObj = {};
      rp(url)
        .then(res => {
          let final = cheerio.load(res);
          return final;
        })
        .then($ => {
          tempName = 'Case ' + index
          tempHold = {}
          tempPetitioner = [];
          tempRespondent = [];
          $(`tr.color6`)
            .find(`a`)
            .attr(`title`, (i, val) => {
              tempPetitioner.push(val.replace('Brief amici curiae of ', '').replace('Brief amicus curiae of ', '').replace(' filed.', '').replace(' (Distributed)', '')
              .replace(' VIDED.', ''))
            });
          $(`tr.color7`)
            .find(`a`)
            .attr(`title`, (i, val) => {
              tempRespondent.push(val.replace('Brief amici curiae of ', '').replace('Brief amicus curiae of ', '').replace(' filed.', '').replace(' (Distributed)', '')
              .replace(' VIDED.', ''))
            });
            tempHold['Respondent'] = tempRespondent
            tempHold['Petitioner'] = tempPetitioner
            tempObj[tempName] = tempHold
            fs.writeFileSync('test.json', JSON.stringify(tempObj))
        });
    })
  })