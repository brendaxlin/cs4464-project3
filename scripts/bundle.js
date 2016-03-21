var speak = require("speakeasy-nlp");
    var lda = require('lda');

    var MAX_ARTICLES = 500;
    var num_articles = 0;
    var page = 1;

    var articles_1836 = {};
    var articles_1880 = {};
    var topics_1836 = {};
    var topics_1880 = {};

    var locAPI = "http://chroniclingamerica.loc.gov/search/pages/results/?";

    while (num_articles < MAX_ARTICLES) {
        $.ajax({
            url: locAPI,
            async: false,
            data: {
                date1: "1836",
                date2: "1920",
                dateFilterType: "yearRange&",
                andtext: "immigrant",
                sequence: "1",
                page: page,
                format: "json"
            },
            success: function(data) {
                console.log("page " + page);
                console.log(data);
                $.each(data.items, function(i, article) {
                    console.log("article " + i + " (" + num_articles + " total)");
                    console.log(article);
                    if (article.ocr_eng && num_articles < MAX_ARTICLES) {
                        var ocr = article.ocr_eng.match(/[^\.!\?]+[\.!\?]+/g);
                        var lda_result = lda(ocr, 2, 5);
                        sentiment = speak.sentiment.analyze(article.ocr_eng).comparative;
                        for (var j = 0; j < lda_result.length; j++) {
                            $.each(lda_result[j], function(j, topic) {
                                score = sentiment * topic.probability;
                                if (article.date < 18650509) {
                                    topics_1836[topic.term] ? topics_1836[topic.term] += score : 
                                    topics_1836[topic.term] = score;
                                    articles_1836[topic.term] ?
                                    articles_1836[topic.term].push(article.url) :
                                    articles_1836[topic.term] = [article.url];
                                } else {
                                    topics_1880[topic.term] ? 
                                    topics_1880[topic.term] += score : 
                                    topics_1880[topic.term] = score;
                                    articles_1880[topic.term] ?
                                    articles_1880[topic.term].push(article.url) :
                                    articles_1880[topic.term] = [article.url];
                                }
                            });
                        }
                        num_articles++;
                    } else if (num_articles >= MAX_ARTICLES) {
                        return false;
                    }
                });
            }
        });
        page++;
    }

    console.log("topics_1836");
    console.log(JSON.stringify(topics_1836));

    console.log("topics_1880");
    console.log(JSON.stringify(topics_1880));

    console.log("articles_1836");
    console.log(JSON.stringify(articles_1836));

    console.log("articles_1880");
    console.log(JSON.stringify(articles_1880));

    var topics_both = {};
    for(var i in topics_1836) {
        if(i in topics_1880) {
            topics_both[i] = {
                before: topics_1836[i],
                after: topics_1880[i]
            }
        }
    }
    console.log("topics_both");
    console.log(JSON.stringify(topics_both));