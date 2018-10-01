const sw = require("stopword");
const elasticsearch = require("elasticsearch");
const util = require("util");
require("dotenv").config({path: "../config/elinode.env"})
var elasticclient = new elasticsearch.Client({
  host: process.env.ELASTIC_HOST,
  log: "info"
});

/**
 * Passed in a an array of strings you get
 * back whether the total supports either a cs or psych focus
 * @param {string} searchTerms
 */
function determine(searchTerms, callback, req, res) {
  if (searchTerms.length < 2) {
    elasticclient.search(
      { index: "eliresume_v4", q: "*:*", size: 500 },
      finishedSearch
    );
  } else {
    const termsList = searchTerms
      .split(/[^a-zA-Z]/)
      .filter(n => n !== "" && n !== undefined);
    let focusTerms = sw.removeStopwords(termsList, sw.en);
    let joined = focusTerms.join("* OR *");
    joined = joined + "*";
    joined = "*" + joined;
    let query = {
      index: "eliresume_v4",
      body: {
        query: {
          query_string: {
            query: `name:(${joined}) OR tags:(${joined}) OR title:(${joined}) OR orgainzation:(${joined}) OR institution:(${joined}) OR focus:(${joined}) OR subject:(${joined}) OR courses:(${joined}) OR accomplishments:(${joined}) OR facets:(${joined}) OR about:(${joined}) OR review:(${joined}) OR title:(${joined}) OR abstract:(${joined})`
          }
        },
        size: 1000
      },
      size: 1000
    };
    elasticclient.search(query, finishedSearch);
  }

  function finishedSearch(err, results) {
    if (
      results === undefined ||
      results.hits === undefined ||
      results.hits.hits === undefined
    ) {
      callback(req, res, {});
      return;
    }
    let educationResults = [];
    let skillResults = [];
    let workResults = [];
    let bookReults = [];
    let paperResults = [];
    let projectResults = [];
    let certificateResults = [];
    let interestResults = [];
    results.hits.hits.forEach(result => {
      let payload = { score: result._score, data: result._source };
      switch (result._type) {
        case "education":
          educationResults.push(payload);
          break;
        case "skills":
          skillResults.push(payload);
          break;
        case "work":
          workResults.push(payload);
          break;
        case "books":
          bookReults.push(payload);
          break;
        case "papers":
          paperResults.push(payload);
          break;
        case "projects":
          projectResults.push(payload);
          break;
        case "certificates":
          certificateResults.push(payload);
          break;
        case "interests":
          interestResults.push(payload);
          break;
      }
    });
    callback(req, res, {
      education: educationResults,
      skills: skillResults,
      work: workResults,
      projects: projectResults,
      books: bookReults,
      papers: paperResults,
      certificates: certificateResults,
      interests: interestResults
    });
  }
}

module.exports = determine;
