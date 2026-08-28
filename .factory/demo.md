# PDF Flow Reader demo

Open **`/demo/`** or choose **Try it with sample data** on the landing page. The demo immediately opens the bundled two-page `reading-routine.pdf`, a realistic short work-reading routine with headings and paragraphs.

The demo uses the IndexedDB database named `demo:pdf-flow-reader`. It never reads or writes the regular `pdf-flow-reader` library. Its persistent banner offers **Reset demo**, which clears and reloads the sample, and **Start for real**, which clears the demo library before returning to the normal reader.

The sample PDF is shipped in `public/samples/reading-routine.pdf`, so it is included in the service-worker precache and can be opened after the first visit while offline.
