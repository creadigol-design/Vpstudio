# Virtual Studio — Self-Service Virtual Studio Platform

## Technical Product Brief

| | |
|---|---|
| **Working title** | Virtual Studio |
| **Document status** | Initial technical specification |
| **Platform type** | Multi-tenant SaaS with managed studio hardware |
| **Primary market** | Businesses, broadcasters, public-sector organisations, agencies and internal communications teams |
| **Primary use case** | Allow non-technical clients to record, assemble, review and export professional branded video content without requiring a production team for every session. |

---

## 1. Executive summary

The Virtual Studio platform will provide clients with a simple, guided way to create professional presenter-led video content from a fixed studio, portable recording kit or remote browser session.

The platform will combine:

- Managed studio hardware
- A local recording application
- A browser-based client workspace
- Script and running-order tools
- Teleprompter functionality
- Automated media upload
- Template-driven video assembly
- Captions and graphic overlays
- Automated audio processing
- Review and approval workflows
- Multi-format exports
- Studio device monitoring
- Organisation-level brand controls

The product should feel like a simple self-service content tool rather than a professional editing suite.

The client should not need to understand cameras, codecs, audio routing, timelines, compositing or rendering.

The core promise is:

> **Select a format, add your content, record each section, review the draft and publish.**

The first release should focus on one repeatable workflow:

> **A single presenter records a branded update in a fixed studio and receives an automatically assembled landscape and vertical video.**

---

## 2. Product goals

### 2.1 Primary goals

The platform must:

- Reduce the cost of producing routine video content
- Allow clients to operate the studio without a producer
- Produce consistent branded output
- Protect clients from technical and brand mistakes
- Capture high-quality original media locally
- Continue recording during internet disruption
- Automate repetitive editing and publishing tasks
- Support English, Welsh and bilingual projects
- Provide optional managed review by a production team
- Create a scalable recurring-revenue product

### 2.2 Secondary goals

The platform should later support:

- Remote contributors
- Interviews
- Multiple cameras
- Social cut-downs
- Training content
- Product demonstrations
- Internal communications
- Live and simulated-live output
- Green-screen environments
- Virtual sets
- Voice-following teleprompters
- Automated content recommendations

### 2.3 Non-goals for the first release

The first version will not be:

- A full nonlinear video editor
- A replacement for Adobe Premiere Pro or DaVinci Resolve
- A fully autonomous creative director
- A real-time Unreal Engine virtual production system
- A live broadcast platform
- A user-generated motion-graphics platform
- A complex multi-camera gallery
- An unrestricted social-media publishing platform

---

## 3. Product principles

### 3.1 Simple by default

The application must minimise production terminology.

Use:

- Record
- Retake
- Review
- Approve
- Export

Avoid exposing terms such as:

- Codec
- Bitrate
- Keyframe interval
- Chroma subsampling
- Render graph
- Media muxing

### 3.2 Guided rather than open-ended

Users should begin with approved programme templates rather than an empty timeline.

### 3.3 Capture locally, process centrally

High-quality source recordings must be stored locally before upload.

The cloud platform should handle:

- Assembly
- Graphics
- Captions
- Audio processing
- Transcoding
- Review copies
- Final delivery

### 3.4 Original media must remain recoverable

Automated processing must never overwrite the source files.

### 3.5 Brand safety by design

Clients should be able to customise content without accidentally changing protected brand elements.

### 3.6 Automation must be reversible

Every automated edit should be visible and recoverable.

### 3.7 Evidence over fabricated scores

Quality-control systems should show measurable evidence.

For example:

- Integrated loudness: -16.2 LUFS
- Audio clipping: none detected
- Captions outside safe area: two
- Missing media: none

The platform should not show arbitrary confidence values unless they are derived from a documented statistical model.

---

## 4. User groups

### 4.1 Platform administrator

Internal operator responsible for the whole service.

Permissions include:

- Create organisations
- Manage subscriptions
- Create templates
- Manage infrastructure
- View all studio devices
- View processing failures
- Access support diagnostics
- Configure retention policies
- Manage feature flags
- Suspend accounts
- View platform usage

### 4.2 Production administrator

Internal producer or agency user.

Permissions include:

- Create client workspaces
- Configure brand kits
- Create programme templates
- Review client videos
- Correct failed renders
- Replace assets
- Approve or reject output
- Export projects
- Provide assisted production support

### 4.3 Organisation administrator

Client-side account owner.

Permissions include:

- Invite users
- Manage client workspaces
- Manage approved brand assets
- View billing and usage
- Configure approval workflows
- Manage retention settings
- Assign roles
- View all organisation projects

### 4.4 Content creator

Client user recording or assembling a video.

Permissions include:

- Create projects
- Select templates
- Add scripts
- Upload assets
- Record content
- Request approval
- Review versions
- Export approved videos

### 4.5 Reviewer

Client stakeholder responsible for feedback or approval.

Permissions include:

- View assigned projects
- Add comments
- Approve or reject versions
- Request changes
- Download approved output

### 4.6 Presenter

Limited user operating the studio.

Permissions include:

- Open assigned recording session
- View script
- Perform equipment check
- Record takes
- Retake sections
- Submit recording

A presenter may not need access to the broader client dashboard.

### 4.7 Remote guest

External participant invited through a secure link.

Permissions include:

- Join a specific recording session
- Complete device checks
- Record local camera and audio
- Upload session media

No account should be required unless requested by the organisation.

---

## 5. Core user journeys

### 5.1 Create a project

1. User signs in.
2. User selects a workspace.
3. User selects a programme template.
4. User enters a project name.
5. User selects the language.
6. User selects the required output formats.
7. The platform creates the project and running order.
8. The user adds script and media.
9. The platform validates required content.
10. The project is marked ready to record.

### 5.2 Record in a fixed studio

1. User opens the assigned recording session.
2. The web application connects to the local studio agent.
3. The agent checks camera, microphone, lights and storage.
4. The user completes a short camera and sound check.
5. The platform presents any warnings.
6. The user begins the first script section.
7. The teleprompter displays the script.
8. The local agent records high-quality media.
9. The user stops the take.
10. A local proxy is created.
11. The user reviews the take.
12. The user accepts or retakes it.
13. The process repeats for each section.
14. Media uploads in recoverable chunks.
15. The user submits the completed session.
16. The project enters the post-production queue.

### 5.3 Record remotely

1. A creator sends a secure guest link.
2. The guest opens the link in a supported browser.
3. The browser checks camera, microphone and bandwidth.
4. The guest records a short test.
5. The system records a live WebRTC reference stream.
6. High-quality media is recorded locally in the browser.
7. Local media uploads after or during the recording.
8. The platform synchronises each participant.
9. The project moves into automated assembly.

### 5.4 Review a draft

1. The user receives a notification when the draft is ready.
2. The user opens the review player.
3. The user can add time-coded comments.
4. The user can request a retake, replace an asset or edit text.
5. The system creates a new version.
6. Reviewers approve or reject the version.
7. Approved output is unlocked for export.

### 5.5 Export content

1. User selects an approved version.
2. User chooses an export preset.
3. The platform checks brand and quality rules.
4. The export is queued.
5. The platform creates the required formats.
6. The user is notified when files are ready.
7. Files are available through secure time-limited links.

---

## 6. Proposed system architecture

The system will consist of five primary layers.

```
Studio Hardware
      │
      ▼
Local Capture Agent
      │
      ▼
Client Web Application
      │
      ▼
Cloud Application and Media Services
      │
      ▼
Storage, Rendering and Distribution
```

### 6.1 Studio hardware layer

Responsible for:

- Camera capture
- Audio capture
- Lighting
- Teleprompter
- Confidence monitoring
- Local storage
- Physical controls
- Network connectivity
- Power resilience

### 6.2 Local capture agent

Responsible for:

- Device discovery
- Hardware health checks
- Local high-quality recording
- Proxy generation
- Session metadata
- Teleprompter coordination
- Resumable uploads
- Local recovery
- Software updates
- Diagnostics

### 6.3 Client web application

Responsible for:

- Authentication
- Project creation
- Running orders
- Script editing
- Recording controls
- Review and approval
- Asset management
- Export controls
- Organisation settings

### 6.4 Cloud application services

Responsible for:

- Business logic
- User and organisation management
- Project management
- Media metadata
- Rendering queues
- Notifications
- Permissions
- Billing and usage
- Device management

### 6.5 Media-processing layer

Responsible for:

- File validation
- Proxy generation
- Transcription
- Audio processing
- Caption generation
- Graphic rendering
- Video composition
- Transcoding
- Quality control
- Packaging and delivery

---

## 7. Recommended technology stack

### 7.1 Front end

Recommended:

- Next.js
- React
- TypeScript
- Tailwind CSS or a controlled design system
- TanStack Query
- Zustand or Redux Toolkit where complex state is required
- WebSocket or server-sent events for real-time status
- Progressive Web App support

The application must support:

- Chrome
- Edge
- Safari where hardware features permit
- Desktop and tablet layouts
- Touchscreen studio operation

The fixed-studio interface should operate in kiosk mode.

### 7.2 Backend API

Recommended:

- Node.js
- NestJS
- TypeScript
- REST API for standard resources
- WebSocket gateway for live studio status
- OpenAPI documentation

Alternative:

- Python with FastAPI for a Python-led engineering team

The system should keep media-processing workers separate from the main application API.

### 7.3 Database

Recommended:

- PostgreSQL

Use PostgreSQL for:

- Users
- Organisations
- Workspaces
- Projects
- Scripts
- Running orders
- Versions
- Approvals
- Comments
- Device records
- Billing records
- Audit logs
- Template configuration
- Media metadata

### 7.4 Cache and queue coordination

Recommended:

- Redis

Use Redis for:

- Job locks
- Session state
- Rate limiting
- Temporary device status
- Render progress
- WebSocket fan-out
- Short-lived tokens

### 7.5 Background jobs

Recommended options:

- BullMQ for an initial Node.js implementation
- Temporal for durable long-running workflows
- AWS Step Functions for an infrastructure-led AWS implementation

A media project may take minutes or hours to process, so jobs must be resumable and idempotent.

### 7.6 Object storage

Recommended:

- Amazon S3 or an S3-compatible service

Separate storage prefixes or buckets should exist for:

- Raw recordings
- Audio masters
- Proxy media
- User assets
- Templates
- Transcripts
- Draft renders
- Approved masters
- Export files
- Archived projects
- Diagnostic bundles

### 7.7 Content delivery

Recommended:

- CloudFront or equivalent CDN
- Signed URLs
- Time-limited download links
- Adaptive preview streaming where required

### 7.8 Rendering

Recommended:

- FFmpeg for media operations
- Remotion or a custom React composition engine for graphics
- Containerised render workers
- Managed transcoding for final delivery where appropriate

Use FFmpeg for:

- Cutting
- Concatenation
- Audio mapping
- Audio normalisation
- Scaling
- Chroma key
- Caption burn-in
- Format conversion
- Thumbnail creation
- Proxy generation

Use a component-based renderer for:

- Lower-thirds
- Titles
- Intro sequences
- Outro sequences
- Branded panels
- Animated statistics
- Picture-in-picture layouts
- Vertical compositions

### 7.9 Infrastructure

Recommended initial platform:

- AWS
- ECS or Kubernetes for workers
- RDS PostgreSQL
- ElastiCache Redis
- S3
- CloudFront
- SQS where appropriate
- CloudWatch
- Secrets Manager
- Web Application Firewall

A simpler initial deployment could use:

- Vercel for the web application
- Managed PostgreSQL
- Managed Redis
- S3-compatible storage
- Dedicated container workers

Rendering should not run inside serverless functions with short execution limits.

---

## 8. Local capture agent

### 8.1 Purpose

The capture agent is a desktop application installed on each managed studio computer.

The client web application will communicate with it securely.

The local agent protects the workflow from:

- Browser limitations
- Internet failure
- Long recording instability
- File-size limits
- Hardware inconsistencies
- Loss of source media

### 8.2 Recommended implementation

Possible implementation:

- Tauri
- Rust core
- TypeScript user interface
- Native FFmpeg integration
- Local HTTP or WebSocket service

Alternative:

- Electron with Node.js

Tauri is preferable where:

- Smaller application size matters
- Reduced memory usage is important
- Native security controls are required

Electron may be preferable where:

- Development speed is the priority
- Existing JavaScript expertise is stronger
- Hardware integrations are straightforward

### 8.3 Agent responsibilities

The agent must:

- Register the studio device
- Authenticate with the platform
- Detect attached hardware
- Validate approved device IDs
- Run startup checks
- Record source video
- Record isolated audio
- Generate low-resolution proxies
- Store recording metadata
- Upload media in chunks
- Resume interrupted uploads
- Encrypt local project files
- Report device status
- Receive remote configuration
- Download software updates
- Preserve incomplete recordings
- Clean up expired local media

### 8.4 Local API

The local agent should expose a restricted local API.

Example endpoints:

```
GET  /health
GET  /devices
GET  /storage
POST /session/start
POST /recording/start
POST /recording/stop
POST /recording/accept
POST /recording/discard
POST /teleprompter/update
POST /upload/retry
GET  /uploads
GET  /diagnostics
```

The API should:

- Bind only to localhost
- Require a session token
- Validate the calling origin
- Rotate tokens
- Reject external network access
- Log sensitive actions

### 8.5 Local recording structure

Example:

```
/project-id/
  session.json
  takes/
    section-01/
      take-01/
        camera-master.mov
        presenter-audio.wav
        backup-audio.wav
        proxy.mp4
        metadata.json
    section-02/
  logs/
  upload-state.json
```

### 8.6 Recording metadata

Store:

- Project ID
- Session ID
- Organisation ID
- Studio device ID
- Section ID
- Take number
- Start timestamp
- Stop timestamp
- Frame rate
- Resolution
- Codec
- Audio sample rate
- Camera device identifier
- Microphone identifier
- Dropped frames
- Audio peaks
- Network status
- Agent version
- Upload state
- Presenter-selected take status

---

## 9. Hardware specification

### 9.1 MVP studio hardware

The recommended minimum fixed installation:

- One fixed 4K camera
- One fixed lens
- Mains power adaptor
- USB or HDMI capture interface
- One wireless lavalier microphone
- One backup shotgun microphone
- One audio interface where needed
- One teleprompter
- One presenter display
- One touchscreen control display
- Three-point lighting
- Fixed physical or branded background
- Dedicated studio computer
- Wired Ethernet
- Local SSD storage
- Uninterruptible power supply
- Smart relay or managed power control

### 9.2 Studio computer specification

Recommended baseline:

- Modern eight-core processor
- 32 GB RAM
- 1 TB minimum NVMe storage
- 2 TB preferred
- Hardware H.264 and H.265 encoding
- Dedicated GPU where segmentation or keying is local
- Gigabit Ethernet
- Multiple USB 3 ports
- Display outputs for teleprompter and control monitor
- Managed operating system
- Automatic security updates
- Device management client

### 9.3 Camera requirements

The camera should support:

- Clean HDMI or high-quality USB output
- 4K capture
- Fixed white balance
- Fixed exposure
- Fixed focus
- Mains power
- Remote restart where possible
- Approved frame rates
- Consistent colour profile

Camera settings should be locked after installation.

### 9.4 Audio requirements

Primary presenter microphone:

- Wireless lavalier or fixed broadcast microphone
- Reliable receiver
- Visible battery state
- Replaceable or rechargeable batteries
- Separate recorded audio track

Backup microphone:

- Fixed shotgun microphone
- Permanently connected
- Lower-priority safety recording

### 9.5 Lighting requirements

The studio should use:

- Soft key light
- Fill light
- Back or hair light
- Background light where required
- Fixed positions
- Consistent colour temperature
- Smart or physical one-button power control

### 9.6 Physical setup

The studio should include:

- Floor position markers
- Fixed presenter position
- Fixed camera height
- Acoustic treatment
- Controlled natural light
- Cable management
- Clearly labelled emergency instructions
- Physical support contact details
- Lockable technical cabinet where appropriate

---

## 10. Device health and monitoring

Each studio device must report:

- Online status
- Last check-in
- Agent version
- Operating system
- Camera state
- Microphone state
- Backup microphone state
- Teleprompter state
- Light-control state
- Local disk capacity
- Upload queue
- Internet speed
- Last successful recording
- Last successful upload
- Current warnings
- Current errors

### 10.1 Example device status

```
Studio: Cardiff Office 01
Status: Online
Camera: Connected
Primary microphone: Connected
Backup microphone: Connected
Teleprompter: Connected
Free storage: 712 GB
Upload queue: 0
Agent version: 1.3.0
Last check-in: 15 seconds ago
```

### 10.2 Remote actions

Authorised support users may:

- Restart the capture agent
- Retry uploads
- Refresh hardware detection
- Download diagnostic logs
- Push configuration
- Schedule an application update
- Lock recording
- Place the studio into maintenance mode

Full remote desktop access should not be available by default.

---

## 11. Project structure

Each project should contain:

- Project metadata
- Selected programme template
- Language setting
- Output formats
- Running order
- Script versions
- Uploaded assets
- Recording sessions
- Takes
- Selected takes
- Transcripts
- Captions
- Draft versions
- Comments
- Approvals
- Exports
- Audit history

### 11.1 Project statuses

Recommended states:

```
DRAFT
READY_FOR_RECORDING
RECORDING
UPLOADING
PROCESSING
DRAFT_READY
CHANGES_REQUESTED
AWAITING_APPROVAL
APPROVED
EXPORTING
COMPLETED
ARCHIVED
FAILED
```

Status transitions should be validated by the backend.

---

## 12. Running-order model

A programme is made from ordered content blocks.

Supported initial block types:

- Opening title
- Presenter section
- Headline
- Image
- Video clip
- Quote
- Statistic
- Call to action
- Closing title
- Credits

Example structure:

```json
{
  "projectId": "project_123",
  "items": [
    {
      "id": "item_1",
      "type": "opening",
      "position": 1,
      "required": true
    },
    {
      "id": "item_2",
      "type": "presenter",
      "position": 2,
      "scriptSectionId": "script_1"
    },
    {
      "id": "item_3",
      "type": "image",
      "position": 3,
      "assetId": "asset_72"
    },
    {
      "id": "item_4",
      "type": "closing",
      "position": 4
    }
  ]
}
```

Each block should declare:

- Required fields
- Allowed durations
- Supported assets
- Available layouts
- Review rules
- Translation requirements
- Brand restrictions

---

## 13. Script editor

### 13.1 Core features

The script editor should support:

- Rich text
- Section-based scripts
- Presenter notes
- Pronunciation guidance
- Pause markers
- Emphasis markers
- Estimated duration
- Reading-speed controls
- Version history
- Comments
- Welsh and English variants
- Import from Word or plain text
- Copy-and-paste cleaning

### 13.2 Bilingual content model

English and Welsh scripts should be linked as separate language versions.

Do not overwrite one language with another.

Example:

```
Content item
├── English version
└── Welsh version
```

The platform should support:

- English-only projects
- Welsh-only projects
- Separate English and Welsh videos
- Bilingual videos
- Shared media across both versions
- Different caption files for each language

### 13.3 Welsh-language support

The application should include:

- Welsh spellchecking where available
- User-controlled North and South Wales terminology preferences
- Pronunciation notes
- Protected names
- Organisation terminology
- Approved translations
- Manual review controls

Automated language support should remain optional and reviewable.

---

## 14. Teleprompter

### 14.1 MVP functionality

The teleprompter must provide:

- Large readable script
- Adjustable font size
- Adjustable scroll speed
- Manual pause
- Previous and next section
- Section progress
- Remote touchscreen control
- Countdown before recording
- Presenter-safe mode
- Mirror mode for physical glass prompters

### 14.2 Teleprompter state

The app should record:

- Script version used
- Scroll speed
- Section start time
- Section end time
- Pauses
- Manual jumps
- Presenter position in the script

### 14.3 Later functionality

Future releases may include:

- Voice-following scroll
- Automatic pause detection
- Presenter pace feedback
- Pronunciation rehearsal
- Dual-language prompting
- Remote producer control

---

## 15. Recording workflow

### 15.1 Pre-flight checks

Before recording, the platform must check:

- Camera connected
- Correct camera selected
- Approved resolution
- Approved frame rate
- Microphone connected
- Audio detected
- Audio not clipping
- Backup audio available
- Disk space available
- Network available
- Lighting system online
- Teleprompter connected
- Local agent up to date
- No previous upload blocking the device

### 15.2 User-facing checks

The presenter should see guidance such as:

- Move slightly to your left
- Camera is too low
- Face is underexposed
- Microphone level is too low
- Background noise is high
- Please look towards the camera
- You are ready to record

### 15.3 Take management

Each script section may have multiple takes.

The presenter can:

- Accept the latest take
- Watch the proxy
- Record another take
- Mark a take as preferred
- Leave a note
- Return to a previous section

No source file should be physically deleted during the active session.

Rejected takes may be hidden from the standard interface but retained until the project retention window expires.

---

## 16. Media upload

### 16.1 Upload requirements

Uploads must be:

- Multipart
- Resumable
- Checksummed
- Retried automatically
- Encrypted in transit
- Mapped to a project and take
- Idempotent
- Observable through the admin dashboard

### 16.2 Upload workflow

1. Agent requests an upload session.
2. Backend creates signed multipart-upload instructions.
3. Agent splits the file into chunks.
4. Agent uploads chunks.
5. Agent records progress locally.
6. Failed chunks retry with exponential backoff.
7. Backend confirms completion.
8. Media validation job begins.
9. Local media remains until cloud validation succeeds.
10. Local cleanup occurs according to policy.

### 16.3 Upload states

```
PENDING
UPLOADING
PAUSED
RETRYING
VERIFYING
COMPLETE
FAILED
CANCELLED
```

---

## 17. Media ingestion

The ingestion service must:

- Verify file integrity
- Confirm expected duration
- Read codec metadata
- Confirm audio tracks
- Detect corrupt media
- Create technical metadata
- Generate a preview image
- Create a low-resolution proxy if required
- Store validation results
- Trigger downstream processing

Use `ffprobe` or an equivalent media-inspection tool.

---

## 18. Automated post-production pipeline

### 18.1 Pipeline stages

```
Ingest
  ↓
Validation
  ↓
Proxy creation
  ↓
Audio extraction
  ↓
Transcription
  ↓
Script alignment
  ↓
Take assembly
  ↓
Audio processing
  ↓
Background treatment
  ↓
Graphics composition
  ↓
Captions
  ↓
Draft render
  ↓
Automated quality control
  ↓
Client review
```

### 18.2 Job design

Each stage should be:

- Independent
- Retriable
- Idempotent
- Observable
- Versioned
- Able to resume from failure
- Associated with clear inputs and outputs

### 18.3 Example workflow record

```json
{
  "projectVersionId": "version_102",
  "jobs": [
    {
      "type": "TRANSCRIBE",
      "status": "COMPLETE"
    },
    {
      "type": "AUDIO_PROCESS",
      "status": "COMPLETE"
    },
    {
      "type": "COMPOSE",
      "status": "RUNNING",
      "progress": 58
    }
  ]
}
```

---

## 19. Transcription and captions

### 19.1 Requirements

The transcription system should support:

- English
- Welsh
- Mixed English and Welsh
- Speaker labels where possible
- Word-level timestamps
- Segment-level timestamps
- Manual correction
- Caption export

### 19.2 Caption formats

Support:

- SRT
- VTT
- Burnt-in captions
- Clean output without captions
- Caption style presets

### 19.3 Caption editor

The editor should allow:

- Text correction
- Timing adjustment
- Line-break adjustment
- Speaker labels
- Protected-word corrections
- Search and replace
- Welsh and English variants
- Safe-area preview

### 19.4 Caption safety rules

Validate:

- Maximum line count
- Maximum characters per line
- Minimum display duration
- Maximum display duration
- Reading speed
- Safe-area position
- Overlapping captions
- Empty captions

---

## 20. Audio processing

The audio pipeline should support:

- Noise reduction
- High-pass filtering
- Equalisation
- Compression
- De-essing
- Limiting
- Loudness normalisation
- Music ducking
- Channel mapping
- Silence detection
- Peak detection

Store both:

- Original audio
- Processed audio

The platform should not permanently bake processing into the source recording.

### 20.1 Audio QC

Record:

- Maximum peak
- Integrated loudness
- Loudness range
- Clipping count
- Silence duration
- Channel count
- Sample rate
- Processing chain version

---

## 21. Template and brand system

### 21.1 Brand kit

Each organisation or workspace may define:

- Primary logo
- Secondary logo
- Brand colours
- Heading font
- Body font
- Caption style
- Lower-third style
- Intro animation
- Outro animation
- Music
- Legal text
- Watermarks
- Safe-area rules
- Approved terminology

### 21.2 Brand permissions

Brand attributes should be marked as:

- Locked
- Admin-editable
- Creator-editable
- Template-specific

A content creator should not be able to change locked brand values.

### 21.3 Template structure

A template should define:

- Supported aspect ratios
- Running-order structure
- Required sections
- Optional sections
- Scene layouts
- Animation timings
- Graphic components
- Audio rules
- Caption rules
- Export presets
- User-editable fields
- Locked elements

### 21.4 Template versioning

Existing projects must continue using the template version they were created with unless explicitly upgraded.

Store:

- Template ID
- Template version
- Brand-kit version
- Renderer version
- Export-preset version

---

## 22. Rendering system

### 22.1 Composition model

A project version should generate a deterministic composition manifest.

Example:

```json
{
  "width": 1920,
  "height": 1080,
  "frameRate": 25,
  "durationFrames": 4500,
  "scenes": [
    {
      "type": "opening",
      "startFrame": 0,
      "durationFrames": 100
    },
    {
      "type": "presenter",
      "startFrame": 100,
      "durationFrames": 3600,
      "source": "media_123"
    }
  ]
}
```

### 22.2 Render worker responsibilities

A render worker must:

- Fetch project manifest
- Resolve media URLs
- Download required assets
- Verify asset checksums
- Render the composition
- Upload the output
- Record progress
- Create render logs
- Trigger quality control
- Clean temporary storage

### 22.3 Render worker scaling

Workers should scale based on:

- Queue length
- Requested output resolution
- Output duration
- GPU requirements
- Priority tier
- Client service level

### 22.4 Output presets

Initial presets:

- 1920 × 1080 landscape
- 1080 × 1920 vertical
- 1080 × 1080 square
- Captioned landscape
- Clean landscape
- Captioned vertical
- Audio-only MP3
- Transcript
- SRT
- VTT

### 22.5 Social reframing

For V1, vertical output should use template-controlled layouts rather than automatic cropping alone.

Example:

```
Landscape:
Presenter left, graphic right

Vertical:
Presenter upper section, graphic lower section
```

---

## 23. Virtual studio treatment

### 23.1 V1 approach

The first version should use either:

- A real physical branded background
- A controlled green screen
- A 2.5D virtual studio composition

A 2.5D virtual studio may include:

- Static or looping studio background
- Presenter layer
- Foreground desk
- Screen graphics
- Light wrap
- Drop shadow
- Lower-thirds
- Subtle parallax
- Branded transitions

### 23.2 Green-screen processing

If green screen is used, the processing service should support:

- Chroma key
- Spill suppression
- Edge refinement
- Shadow preservation where possible
- Matte preview
- Key-quality warnings

The original unkeyed source must be retained.

### 23.3 Full 3D expansion

A future release may integrate a real-time 3D engine for:

- Multiple virtual cameras
- Dynamic lighting
- Tracked camera movement
- Data-driven 3D graphics
- Live virtual production

This is explicitly outside the MVP.

---

## 24. Review and approval

### 24.1 Review player

The review experience should include:

- Video playback
- Frame-accurate or near-frame-accurate comments
- Time-coded comments
- Comment resolution
- Version switching
- Approval controls
- Download permissions
- Caption visibility toggle
- Safe-area preview

### 24.2 Review actions

Reviewers may:

- Approve
- Reject
- Request changes
- Add a comment
- Assign a comment
- Resolve a comment
- Compare versions

### 24.3 Approval rules

Approval may require:

- One named approver
- Any one member of an approval group
- All required approvers
- Internal production approval before client approval
- Brand approval
- Legal approval

### 24.4 Version model

Every meaningful change should create a new project version.

A version should capture:

- Script version
- Selected takes
- Asset selections
- Caption version
- Template version
- Brand-kit version
- Render manifest
- Render outputs
- Approval status

---

## 25. Automated quality control

### 25.1 Technical checks

The QC service should inspect:

- File integrity
- Resolution
- Frame rate
- Duration
- Missing frames
- Black frames
- Frozen frames
- Audio presence
- Audio clipping
- Audio loudness
- Audio/video synchronisation
- Missing assets
- Caption overlap
- Caption overflow
- Safe-area violations
- Logo resolution
- Export completeness

### 25.2 Content checks

Configurable checks may include:

- Required disclaimer present
- Required logo present
- Required closing frame present
- Presenter name supplied
- Captions generated
- Approved music used
- Correct brand selected
- Correct language selected

### 25.3 QC output

Each check should return:

- Name
- Status
- Measured value
- Expected value
- Severity
- Evidence
- Suggested action

Example:

```json
{
  "check": "audio_loudness",
  "status": "PASS",
  "measured": "-15.9 LUFS",
  "expected": "-16 ± 1 LU",
  "severity": "INFO"
}
```

---

## 26. Notifications

Support:

- Email
- In-app notifications
- Optional Microsoft Teams or Slack integration later

Notification events:

- Recording assigned
- Upload completed
- Upload failed
- Draft ready
- Comment added
- Changes requested
- Approval requested
- Project approved
- Export ready
- Export failed
- Studio offline
- Hardware warning
- Storage warning
- Subscription limit reached

Users must be able to manage notification preferences.

---

## 27. Data model

### 27.1 Primary entities

- User
- Organisation
- Workspace
- Membership
- Role
- BrandKit
- ProgrammeTemplate
- TemplateVersion
- Project
- ProjectVersion
- RunningOrderItem
- Script
- ScriptVersion
- RecordingSession
- Take
- MediaAsset
- Transcript
- CaptionTrack
- Comment
- ApprovalRequest
- ApprovalDecision
- ExportPreset
- ExportJob
- RenderJob
- QualityCheck
- StudioDevice
- DeviceComponent
- UploadSession
- Subscription
- UsageRecord
- AuditEvent

### 27.2 Example organisation hierarchy

```
Organisation
├── Workspaces
│   ├── Brand kits
│   ├── Templates
│   ├── Projects
│   └── Studio devices
├── Users
├── Subscription
└── Usage
```

### 27.3 Tenant isolation

Every tenant-owned record must include:

- Organisation ID
- Workspace ID where applicable

Backend services must enforce tenant access.

Do not rely solely on front-end filtering.

---

## 28. Authentication and authorisation

### 28.1 Authentication

Support:

- Email and password
- Passwordless email link
- Google authentication
- Microsoft authentication
- Multi-factor authentication
- Enterprise single sign-on later

### 28.2 Authorisation

Use role-based access control with resource-level validation.

Example roles:

- Platform admin
- Production admin
- Organisation admin
- Creator
- Presenter
- Reviewer
- Guest

### 28.3 Secure guest links

Guest links should:

- Be single-purpose
- Expire
- Be revocable
- Be associated with one session
- Use signed tokens
- Avoid exposing project data beyond the session

---

## 29. Security requirements

The platform must include:

- TLS for all network traffic
- Encryption at rest
- Signed media URLs
- Secret rotation
- Least-privilege access
- Multi-tenant isolation
- Audit logging
- Malware scanning for uploads
- Content-type validation
- Rate limiting
- Brute-force protection
- Session expiry
- Secure cookies
- Cross-site request-forgery protection
- Content Security Policy
- Dependency scanning
- Container scanning
- Infrastructure logging
- Data-export controls
- Data-deletion workflows

### 29.1 Local device security

The studio computer should:

- Use a managed user account
- Prevent standard desktop access
- Encrypt the local disk
- Restrict USB storage where appropriate
- Run approved software only
- Auto-lock maintenance controls
- Use signed application updates
- Report security state

### 29.2 Support access

Support actions must be:

- Role-restricted
- Logged
- Time-stamped
- Associated with a named operator
- Visible to organisation administrators where appropriate

---

## 30. Privacy and compliance

The system will process:

- Video recordings
- Voice recordings
- Names
- Job titles
- Scripts
- Uploaded business content
- Usage data
- Device diagnostics

The product should provide:

- Data-processing agreements
- Configurable retention
- Data export
- User deletion
- Organisation deletion
- Consent wording for remote guests
- Regional storage options
- Audit records
- Clear media ownership terms
- Clear training-data policy

Client media should not be used to train external models without explicit agreement.

---

## 31. Storage and retention

### 31.1 Storage categories

- Raw media
- Processed media
- Proxy media
- Project assets
- Transcripts
- Captions
- Draft renders
- Approved masters
- Exports
- Diagnostics

### 31.2 Example retention policy

Configurable defaults:

- Local studio media: retained until cloud verification plus seven days
- Raw cloud media: 90 days
- Draft renders: 30 days
- Approved masters: based on subscription
- Deleted projects: recoverable for 30 days
- Diagnostic logs: 30–90 days
- Audit logs: longer retention based on contract

### 31.3 Lifecycle automation

Object-storage lifecycle rules should:

- Move older raw files to cheaper storage
- Delete temporary worker files
- Remove expired exports
- Preserve approved masters
- Respect legal holds
- Record deletion events

---

## 32. Billing and usage

### 32.1 Commercial structure

Potential model:

- Initial studio installation fee
- Monthly platform subscription
- Included recording or rendering allowance
- Additional storage charges
- Additional rendering charges
- Bespoke template fees
- Managed review fees
- Support-level upgrades

### 32.2 Usage metrics

Track:

- Active users
- Projects created
- Recording minutes
- Uploaded storage
- Render minutes
- Export minutes
- Number of templates
- Number of workspaces
- Number of studio devices
- Retained storage
- Remote guest minutes

### 32.3 Limit enforcement

Limits should be configurable by subscription.

When a limit is reached:

- Warn before blocking
- Allow an administrator override
- Preserve active recordings
- Never interrupt a recording in progress
- Prevent new exports or projects only where appropriate

---

## 33. Analytics

### 33.1 Client analytics

Show:

- Projects created
- Videos completed
- Average turnaround
- Recording minutes
- Retake rate
- Most-used templates
- Most-used output formats
- Approval time
- Storage usage

### 33.2 Operational analytics

Show:

- Upload failure rate
- Render failure rate
- Average render duration
- Device uptime
- Hardware failure patterns
- Support incidents
- Average takes per section
- Average project completion time
- Queue depth
- Worker utilisation

Analytics should be factual and interpretable.

---

## 34. Logging and observability

The platform should implement:

- Structured logs
- Centralised error reporting
- Distributed tracing
- Metrics
- Service dashboards
- Render logs
- Upload logs
- Device logs
- Audit logs

Each project should have a traceable activity chain.

Example:

```
14:02 Project created
14:18 Recording started
14:26 Take 2 accepted
14:31 Upload started
14:37 Upload verified
14:38 Transcription queued
14:41 Draft render started
14:48 Draft render completed
14:49 QC completed with one warning
```

---

## 35. Failure handling

### 35.1 Recording failures

The system must recover from:

- Camera disconnection
- Microphone disconnection
- Application closure
- Computer restart
- Internet loss
- Low disk space
- Incomplete recording
- Upload interruption

### 35.2 Render failures

The system must:

- Retry transient errors
- Avoid duplicate outputs
- Preserve job history
- Provide an understandable error
- Allow manual retry
- Allow restart from a failed stage
- Alert support after repeated failure

### 35.3 Graceful degradation

Where possible:

- Record offline
- Continue without cloud preview
- Use the backup microphone
- Delay uploads
- Preserve already completed takes
- Allow later project submission

---

## 36. APIs

### 36.1 Core API groups

Suggested API domains:

```
/auth
/users
/organisations
/workspaces
/projects
/scripts
/running-orders
/recording-sessions
/takes
/assets
/uploads
/templates
/brands
/renders
/exports
/reviews
/approvals
/comments
/devices
/notifications
/billing
/admin
```

### 36.2 API standards

The API should use:

- Versioned endpoints
- Validated schemas
- Consistent error objects
- Pagination
- Idempotency keys for writes
- Request IDs
- Role validation
- Tenant validation
- OpenAPI documentation

### 36.3 Webhooks

Potential outbound webhooks:

- Project created
- Recording completed
- Draft ready
- Approval completed
- Export ready
- Project failed

Webhook delivery should include:

- Signing
- Retry policy
- Delivery logs
- Secret rotation

---

## 37. Feature flags

Use feature flags for:

- Browser recording
- Green-screen processing
- Remote guests
- Automated take recommendations
- Bilingual tools
- Direct social publishing
- Managed review
- Advanced templates
- Voice-following teleprompter
- Experimental media analysis

New capabilities should default to off until validated.

---

## 38. Accessibility

The client application should target WCAG 2.2 AA.

Requirements include:

- Keyboard navigation
- Visible focus
- Screen-reader labels
- Sufficient contrast
- Adjustable teleprompter text
- Captions
- Reduced-motion support
- Error messages that do not rely on colour
- Touch targets suitable for studio use
- Plain-language instructions

The recording workflow should support users with varying technical confidence.

---

## 39. Internationalisation

The system should be built for localisation from the start.

Initial languages:

- English
- Welsh

Requirements:

- No hardcoded interface strings
- Locale-aware dates
- Locale-aware time
- Locale-aware number formatting
- Correct plural handling
- Separate content language from interface language
- Welsh and English email templates
- Welsh and English error messages

---

## 40. MVP scope

### 40.1 Included

**Client application**

- Sign in
- Organisation and workspace selection
- Project creation
- Template selection
- Script editor
- Running order
- Asset upload
- Language selection
- Recording-session launch
- Project dashboard
- Draft review
- Comments
- Basic approval
- Export download

**Studio application**

- Device registration
- Camera detection
- Microphone detection
- Hardware checks
- Local recording
- Section-by-section workflow
- Teleprompter
- Retakes
- Proxy playback
- Local media storage
- Resumable upload
- Device status reporting

**Media processing**

- Ingestion
- File validation
- Proxy generation
- Take assembly
- Basic audio normalisation
- Opening title
- Closing title
- Lower-third
- Caption generation
- Landscape render
- Vertical render
- Quality checks

**Administration**

- Organisation management
- User management
- Brand-kit setup
- Template setup
- Device dashboard
- Project support view
- Render-job view
- Upload status
- Usage summary

### 40.2 Excluded

- Full timeline editing
- Multi-camera direction
- Real-time live broadcasting
- Full Unreal Engine set
- Open-ended design tools
- Automated B-roll generation
- Automated script rewriting
- Direct publishing integrations
- Large remote panels
- End-user template creation
- Complex billing automation

---

## 41. Delivery phases

### Phase 0: Discovery and proof of concept

Objectives:

- Confirm target client workflow
- Select hardware
- Test local capture
- Test teleprompter
- Test upload resilience
- Test rendering
- Produce one end-to-end sample

Outputs:

- Hardware shortlist
- Recording test
- Local agent prototype
- Basic composition prototype
- Technical risk register
- Refined MVP scope

### Phase 1: Studio capture appliance

Build:

- Studio registration
- Hardware detection
- Pre-flight checks
- Local recording
- Teleprompter
- Retakes
- Proxy creation
- Resumable upload
- Basic device monitoring

Success condition:

> A non-technical user can record and submit a complete session without support.

### Phase 2: Automated production

Build:

- Ingestion
- Media validation
- Audio processing
- Caption generation
- Template composition
- Landscape export
- Vertical export
- Basic QC
- Project-status notifications

Success condition:

> A submitted recording produces a consistent branded draft automatically.

### Phase 3: Client platform

Build:

- Multi-tenant organisations
- User roles
- Project management
- Review player
- Comments
- Approvals
- Versioning
- Brand management
- Export management

Success condition:

> A client can create, record, approve and download a project independently.

### Phase 4: Operational platform

Build:

- Subscription controls
- Usage tracking
- Device fleet management
- Support tools
- Retention controls
- Audit reporting
- Service dashboards
- Automated maintenance

### Phase 5: Remote recording

Build:

- Guest links
- Browser pre-flight
- WebRTC reference call
- Local browser recording
- Resumable guest upload
- Participant synchronisation
- Interview template

### Phase 6: Advanced automation

Potential features:

- Take recommendations
- Automatic pause removal
- Social cut-down suggestions
- Voice-following teleprompter
- Automated reframing
- Green-screen templates
- Advanced quality guidance
- Content-performance analytics

---

## 42. Suggested development workstreams

### Workstream A: Product and UX

- User research
- User journeys
- Wireframes
- Design system
- Studio touchscreen UX
- Review workflow
- Welsh and English interface
- Accessibility testing

### Workstream B: Studio hardware

- Camera selection
- Audio selection
- Teleprompter
- Lighting
- Computer specification
- Mounting
- Cabling
- Power control
- Hardware documentation
- Installation process

### Workstream C: Capture agent

- Device discovery
- Recording engine
- Proxy generation
- Local state
- Upload client
- Teleprompter integration
- Update system
- Diagnostics

### Workstream D: Platform backend

- Authentication
- Multi-tenancy
- Project API
- Asset API
- Permissions
- Workflow state
- Notifications
- Audit logs

### Workstream E: Media pipeline

- Ingestion
- Validation
- Transcription
- Audio
- Composition
- Rendering
- Export
- QC

### Workstream F: Administration

- Organisation setup
- Brand kits
- Templates
- Device management
- Support tools
- Usage
- Billing controls

### Workstream G: Security and operations

- Infrastructure
- Monitoring
- Backup
- Disaster recovery
- Security review
- Privacy documentation
- Penetration testing
- Incident response

---

## 43. Testing strategy

### 43.1 Unit testing

Cover:

- Permission rules
- Workflow transitions
- Template validation
- Billing limits
- File metadata parsing
- Caption rules
- QC calculations

### 43.2 Integration testing

Cover:

- Agent-to-cloud communication
- Multipart upload
- Render queue
- Storage lifecycle
- Authentication
- Notification delivery
- Approval workflow

### 43.3 Media test library

Create test assets covering:

- 1080p and 4K
- 25 fps and 30 fps
- Long recordings
- Variable audio levels
- Silent audio
- Corrupt files
- Green-screen material
- English speech
- Welsh speech
- Mixed-language speech
- Portrait and landscape assets
- Low-resolution logos
- Long captions

### 43.4 Hardware testing

Test:

- Camera disconnected during standby
- Camera disconnected during recording
- Microphone battery failure
- Backup microphone recovery
- Internet loss
- Computer restart
- Low disk space
- Power interruption
- Teleprompter failure
- Touchscreen failure

### 43.5 User acceptance testing

Test with users who have:

- No production experience
- Basic communications experience
- Professional production experience
- Welsh-language needs
- Accessibility requirements

---

## 44. MVP acceptance criteria

The MVP will be considered successful when:

1. A client can sign in and create a project.
2. A client can choose an approved template.
3. A client can add a script and basic assets.
4. The studio can detect required hardware.
5. The studio can record each section locally.
6. A user can create and select retakes.
7. Recording continues during temporary internet loss.
8. Uploads resume after interruption.
9. Source recordings are preserved.
10. The system automatically assembles selected takes.
11. The system adds approved brand graphics.
12. The system generates captions.
13. The system creates landscape and vertical drafts.
14. The system runs automated technical QC.
15. A client can review and comment on a draft.
16. An authorised reviewer can approve the project.
17. An approved master can be exported.
18. Platform administrators can view studio health.
19. All organisation data is tenant-isolated.
20. The complete workflow is available in English and Welsh.

---

## 45. Key risks

### 45.1 Hardware inconsistency

**Risk:** Different cameras, microphones and operating systems behave unpredictably.

**Mitigation:**

- Approved hardware list
- Fixed installation
- Device identifiers
- Locked settings
- Automated pre-flight checks

### 45.2 Upload failure

**Risk:** Large source files fail on poor client connections.

**Mitigation:**

- Local recording
- Multipart upload
- Resume support
- Proxy-first upload
- Local retention until verification

### 45.3 Automated edit quality

**Risk:** The first draft feels mechanical or makes unsuitable decisions.

**Mitigation:**

- Template-driven editing
- Section-based recording
- Reversible changes
- Human review
- Avoid open-ended autonomous editing in V1

### 45.4 Welsh transcription quality

**Risk:** Welsh or bilingual transcription may require more correction.

**Mitigation:**

- Editable captions
- Organisation terminology
- Protected words
- Human review
- Multiple transcription providers where necessary

### 45.5 Render cost

**Risk:** Rendering long or multiple versions becomes expensive.

**Mitigation:**

- Proxy-based review
- Cache unchanged components
- Re-render only affected sections where possible
- Usage limits
- Tiered rendering priority
- Lifecycle management

### 45.6 Support burden

**Risk:** Each studio becomes a bespoke technical installation.

**Mitigation:**

- Standardised hardware
- Remote health monitoring
- Replaceable kit modules
- Installation checklist
- Clear support boundaries
- Automatic diagnostics

### 45.7 Scope expansion

**Risk:** The product becomes a full editing and live-production platform.

**Mitigation:**

- Fixed MVP workflow
- Feature flags
- Documented non-goals
- Template-first design
- Phase-gated development

---

## 46. Recommended first implementation

The first commercial implementation should be deliberately constrained.

**Studio**

- One presenter
- One fixed camera
- One primary microphone
- One backup microphone
- One teleprompter
- One physical branded background
- One control touchscreen
- One dedicated computer

**Programme format**

- Opening title
- Presenter introduction
- Three presenter sections
- Optional image or video insert
- Call to action
- Closing title

**Outputs**

- 16:9 landscape
- 9:16 vertical
- Captioned version
- Clean version
- SRT
- Transcript

**Client workflow**

```
Create project
→ Add script
→ Record sections
→ Submit
→ Receive draft
→ Review
→ Approve
→ Export
```

This implementation will prove the most important commercial question:

> **Can a non-technical client reliably produce an acceptable professional video without an operator in the room?**

Only after proving that workflow should the platform expand into multi-camera interviews, virtual sets, live production and advanced automated editing.

---

## 47. Recommended repository structure

```
/apps
  /client-web
  /admin-web
  /capture-agent

/services
  /api
  /notifications
  /device-gateway
  /media-ingest
  /transcription
  /audio-processing
  /composition
  /render-worker
  /quality-control

/packages
  /database
  /auth
  /contracts
  /design-system
  /template-schema
  /media-utils
  /logging
  /config
  /i18n

/infrastructure
  /terraform
  /containers
  /monitoring

/docs
  /architecture
  /hardware
  /security
  /operations
  /api
  /templates
```

---

## 48. Initial technical decisions

Recommended initial decisions:

1. Use a web application for project management and review.
2. Use a dedicated local capture agent for permanent studios.
3. Record high-quality source media locally.
4. Upload using resumable multipart uploads.
5. Use PostgreSQL for platform data.
6. Use object storage for all media.
7. Use queue-driven media processing.
8. Use FFmpeg for technical media operations.
9. Use a component-based renderer for branded video templates.
10. Use fixed programme structures rather than a free-form timeline.
11. Support English and Welsh at the data-model level.
12. Treat studio devices as managed platform resources.
13. Preserve source media and project versions.
14. Make all automated changes reviewable.
15. Keep full 3D virtual production outside the first release.

---

## 49. Final product definition

The Virtual Studio platform is not simply a camera-recording application.

It is a complete managed production system made up of:

- A controlled physical recording environment
- A simple studio interface
- A reliable local capture appliance
- A multi-tenant content platform
- An automated media-production pipeline
- A brand-template system
- A review and approval service
- A managed device fleet
- A scalable export and delivery platform

The strongest first product is:

> **A self-service studio appliance that allows a client to record a presenter-led update section by section and automatically receive a branded, captioned, professionally assembled video.**

That narrowly defined workflow should form the foundation for every later feature.

This document is suitable as the master specification for a technical team, with the MVP boundary kept deliberately tight enough to prototype and test.
