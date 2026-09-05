# Research synthesis — UI, UX, copy, stimulation, motion and audio

This document records the rationale behind the v2.2 canonical rules. `design.md` is the binding specification.

## 1. Progressive disclosure is supported, with one qualification

The user's chess analogy is strong: teach interaction before exceptions, then reveal advanced rules when they become relevant.

Research and practitioner material repeatedly favors interactive/contextual learning over front-loaded instruction. Game Accessibility Guidelines explicitly recommends interactive tutorials, contextual help, reminders and practice without failure. A 2026 itch.io thesis write-up found just-in-time teaching more promising than text-heavy front loading and emphasized measuring competence rather than perceived tutorial helpfulness.

**Canonical conclusion:** complexity should be earned through use. Do not hide depth; stage access to it.

## 2. Stable periphery + protected center is directionally right

GMTK's HUD analysis and GDC UI talks show that HUD placement changes what players notice, how they play and how immersed they feel. For this game, the center is unusually valuable because the core work loops are tactile and attention-switching.

The user's correction is adopted: urgency does not automatically justify a center popup. A player-pulled alert inbox can escalate motion/audio without stealing the current input target.

**Canonical conclusion:** stable peripheral awareness, protected central agency, progressive alert escalation.

## 3. High stimulation is compatible with clarity

“Juice” literature demonstrates the value of rich cascading feedback, while Folmer Kelly's “Don't Juice It or Lose It” warns that polish detached from context harms readability and immersion.

The right conclusion is not “avoid stimulation.” It is **orchestrate stimulation**. Routine actions can feel excellent, but milestone language must remain scarce enough to mean something.

**Canonical conclusion:** event priority P0–P4, one lead sensory channel per meaningful event, aggregate repetition, preserve contrast/rest.

## 4. Do not encode demographic stereotypes

The claim that paying players are mostly lonely people on the ADHD spectrum is not supported well enough to become a design premise and would be stigmatizing if treated as fact.

However, many features that help variable-attention players are simply good design: contextual help, replayable instructions, adjustable motion, distinct cues, reduced sensory load options and player-controlled pacing.

**Canonical conclusion:** design for high-stimulation seeking and variable attention without medicalizing the audience.

## 5. Motion should explain physics and state

Game-feel practice emphasizes immediate response, anticipation/reaction, sound/particle reinforcement and careful screenshake. The counterpoint is equally important: decorative motion without contextual meaning becomes noise.

**Canonical conclusion:** use motion to show causality, object physics, urgency and reward tier. Reserve whole-screen/high-amplitude motion for events that deserve it.

## 6. Audio is an information system

GDC adaptive-music and audio-design material treats implementation and state-reactivity as central, not secondary. Accessibility guidance also requires distinct sound choices while ensuring no essential information exists only in audio.

**Canonical conclusion:** separate sonic layers, adaptive arrangement, alert hierarchy, mixing/ducking, repetition management and independent accessibility controls.

## 7. Copy should be concise, clear and authored

GDC writing guidance emphasizes cutting verbal fat and making each line carry impact. Localization sources repeatedly stress context, string structure and UI expansion.

The user's “elite ball knowledge” intuition is adopted with a two-layer safety rule: culturally knowledgeable players can get extra delight, but surface comprehension must work without knowing the reference.

**Canonical conclusion:** memorable culturally literate name + plain-language mechanical meaning; permanent UI skews durable; run-specific content can carry more contemporary references.

## 8. PWA/mobile implications

CrazyGames' current web-game guidance emphasizes device-specific interface design, fast first-frame time, smooth information processing and responsive mobile/desktop support. This reinforces the existing rule that mobile is a recomposition, not a scaled desktop.

**Canonical conclusion:** preserve the semantic HUD zones while allowing rails/drawers/stacks to recompose around the center on small screens.
