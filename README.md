# Motion Measurement from Video

## Introduction

This project is aimed at measuring the motion changes within video frames. It allows users to upload a video and analyze the frame-to-frame pixel intensity differences. These differences are computed for two partitions of each frame: one to the left and one to the right of a user-defined vertical line. The program can export this analysis as a CSV file for further examination.

## Features

- **Video Upload**: Allows the user to upload a video in MP4 format.
- **Split Line**: A user-adjustable vertical line divides the video frame into two regions: left and right. You can change its position with an input field.
- **Analyze Frames**: Computes average pixel intensity differences between successive frames for the left and right regions.
- **Export Data**: Allows the user to export the computed data as a CSV file.

## How to Use

1. **Upload a Video**: Use the "Choose File" button to upload a video in MP4 format.
2. **Adjust the Split Line**: Use the input field labeled "Split Line Position (0-100%)" to move the red vertical line that divides the frame into two regions.
3. **Analyze**: Click the "Analyze Frames" button to start the analysis.
4. **Export Data**: Once the analysis is complete, use the "Export CSV" button to download the data.

## Technical Details

The project uses pure HTML, CSS, and JavaScript for its functionality.

## Author

4egis

Jędrzej Rymsza
