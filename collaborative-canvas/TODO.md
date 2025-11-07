# TODO: Complete Collaborative Canvas Assignment

## Bugs to Fix
- [ ] Fix emitStroke name conflict in canvas.js (calls window.emitStroke but checks typeof emitStroke)
- [ ] Fix cursor metadata in main.js (name and userId set to undefined)
- [ ] Prevent duplicate stroke additions in drawing-state.js (server adds on each emit, but client sends partial and full)
- [ ] Ensure eraser tool properly erases (currently draws with destination-out, but for lines it might not erase fully)
- [ ] Fix quadratic curve in drawSegment (currently using quadraticCurveTo incorrectly for smoothing)

## Missing Core Features
- [ ] Add room system (multiple isolated canvases)
- [ ] Implement drawing persistence (save/load sessions to file)
- [ ] Add mobile touch support (ensure pointer events work, add touch-specific handling if needed)
- [ ] Add performance metrics (FPS counter, latency display)
- [ ] Add bonus tools (shapes: rectangle, circle; text tool)

## Enhancements
- [ ] Improve error handling and validation
- [ ] Add conflict resolution for overlapping draws (though sequential is acceptable)
- [ ] Optimize canvas redrawing (use offscreen canvas for history replay)
- [ ] Add user indicators for drawing state (show when user is actively drawing)

## Documentation and Testing
- [ ] Update README.md with setup, testing, limitations
- [ ] Ensure ARCHITECTURE.md is complete
- [ ] Test with multiple users (open multiple browser tabs)
- [ ] Deploy demo (suggest Heroku/Vercel)

## Deployment
- [ ] Prepare for deployment (ensure no hardcoded localhost)
- [ ] Add demo link instructions
