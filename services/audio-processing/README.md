# audio-processing (planned — Phase 2)

Noise reduction, high-pass, EQ, compression, de-essing, limiting and loudness
normalisation to the platform target (spec §20). Original audio is always
retained alongside the processed track — processing is never baked into the
source recording. Emits measurable QC evidence (integrated loudness, peaks,
clipping count) per spec §20.1 and §3.7.
