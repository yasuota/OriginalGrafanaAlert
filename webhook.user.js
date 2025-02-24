// ==UserScript==
// @name         webhook.user.js
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  Save and reuse query parameters with a right-click menu
// @match        https://observability.secretcdn.net/*
// @grant        none
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    // Enable strict mode to enforce safer JavaScript practices.
    'use strict';

    // Webhook URL for sending notifications.
    const webhookUrl = "https://hooks.slack.com/services/XXXXX";
    // Map to track the last processed timestamp for each panel.
    const runtimeMap = new Map();

    // Function to convert a timestamp string into a Date object.
    function getTargetDate(timestamp) {
        const [year, month, day, time] = timestamp.split('-');  // Split the timestamp into year, month, day, and time.
        const [hour, minute] = time.split(':');// Split the time into hour and minute.
        return new Date(year, month - 1, day, hour, minute); // Create and return a Date object (month is zero-indexed).
    }

    // Function to check if the timestamp is within an acceptable delay (5 minutes).
    function isWithinTimeLimit(variable, nowUtc) {
        const targetDate = getTargetDate(variable) // Convert the timestamp to a Date object.
        const diffInMinutes = (nowUtc - targetDate) / (1000 * 60); // Calculate the difference in minutes.
        return diffInMinutes <= 5;  // Return true if the difference is 5 minutes or less.
    }

    // Function to send a webhook with the given payload.
    function sendWebhook(payload) {
        GM_xmlhttpRequest({
            method: "POST", // Use HTTP POST to send data.
            url: webhookUrl, // The URL to send the request to.
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON.
            },
            data: JSON.stringify(payload), // Convert the payload to a JSON string.
            onload: () => console.log(`Webhook sent successfully`), // Log success when the request completes
            onerror: (error) => console.error(`Failed to send webhook`, error), // Log any errors encountered.
        });
    }

    // Function to create a payload for an alert or error.
    function createPayload(variables, panel) {
        return {
            text: `Detection Details>`,
            icon_emoji: `:warning:`,
            username: "Grafana Alert Bot",
            pretext: "*Grafana Alert!*",
            attachments: [
                {
                    color: "#FF0000",
                    title: "Details",
                    fields: [ // Fields for alert payloads.
                        { title: "Timestamp (UTC)", value: variables?.[2] || "NOT FOUND", short: true },
                        { title: "POP", value: variables?.[4] || "N/A", short: true },
                        { title: "Percentile", value: variables?.[5] + "_" + variables?.[6] + " > " + variables?.[7], short: true },
                        { title: "Value", value: variables?.[3] || "N/A", short: true },
                        { title: "Panel", value: panel || "N/A", short: true },
                    ],
                    footer: "Automated Detection Bot",
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        };
    }

    // Function to create a payload for an error.
    function createPayloadForError(panel) {
        return {
            text: `The BigQuery data for the following panel has not been updated for some time.!>`,
            icon_emoji: `:warning:`,
            username: "Grafana Alert Bot",
            pretext: "*Bigquery didn't return latest records!*",
            attachments: [
                {
                    color: "#FF0000",
                    title: "Details",
                    fields: [
                        { title: "Panel", value: panel || "N/A", short: true },
                    ],
                    footer: "Automated Detection Bot",
                    ts: Math.floor(Date.now() / 1000)
                }
            ]
        };
    }
    // Check for target text every 5 seconds
    setInterval(() => {
        // Grafana_Panelnames 
        const panelList = ["HIT_$Service", "MISSPASS_$Service"];

        // Base regex pattern
        const baseRegex = /(ALERT|NORMAL)_(\d{4}-\d{2}-\d{2}-\d{2}:\d{2})_(\d+\.\d+)_([A-Z]{3})_(P\d+)_([A-Z]{4})_(\d+ms)_/;

        // Get the current date and time
        const nowUtc = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);

        panelList.forEach((panel) => {
            const regex = new RegExp(baseRegex.source + panel, "g"); // Create a specific regex for the panel.
            const records = document.body.innerText.match(regex); // Match the text content with the regex.

            // Flag to ensure the date check runs only once.
            let isDateChecked = null;

            if (records != null) {
                records.forEach((record) => {
                    const regexForParse = new RegExp(baseRegex.source + panel);
                    var variables = record.match(regexForParse);

                    if (!isDateChecked) {
                        // Check if the timestamp is outdated.
                        if (!isWithinTimeLimit(variables[2], nowUtc)) {
                            // Send an error webhook if outdated.
                            sendWebhook(createPayloadForError(panel));
                            return;
                        }
                        // Skip if the timestamp is already processed.
                        if (variables[2] == runtimeMap.get(panel)) {
                            return;
                        }
                        runtimeMap.set(panel, variables[2]) // Update the map with the new timestamp.
                        isDateChecked = true; // Mark the date as checked.

                    }
                    if (record.includes('ALERT')) {  // Check if the record contains an alert.
                        sendWebhook(createPayload(variables, panel)); // Send an alert webhook.
                    }
                });
            }
        });
    }, 5000); // Repeat every 5 seconds.
})();
