"use strict";

const AWS = require("aws-sdk");
const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const s3 = new AWS.S3();
const TikTokScraper = require("tiktok-scraper");
const bucket = process.env.Bucket;

module.exports.handler = async (event, context, callback) => {
  let username =
    (event.queryStringParameters && event.queryStringParameters.username) || "";

  if (!username) {
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "Please input username.",
      }),
    });
    return;
  }

  try {
    const posts = await TikTokScraper.user(username, { number: 1 });

    if (posts.collector && posts.collector.length > 0) {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: true,
          url: posts.collector[0].webVideoUrl,
        }),
      });
      return;
    } else {
      callback(null, {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({
          success: false,
          message: "The post who has the username does not exist.",
        }),
      });
      return;
    }
  } catch (e) {
    callback(null, {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        success: false,
        message: "The user who has the username does not exist.",
      }),
    });
    return;
  }
};
