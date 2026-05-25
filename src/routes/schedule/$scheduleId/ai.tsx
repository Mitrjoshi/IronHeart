import { Header } from "@/components/Header";
import { store } from "@/store/schema";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { Shuffle, Zap, CheckCircle2, ChevronRight } from "lucide-react";
import { useState, useCallback } from "react";

export const Route = createFileRoute("/schedule/$scheduleId/ai")({
  component: RouteComponent,
});

// ─── Theme ────────────────────────────────────────────────────────────────────
const S = {
  page: { background: "#0e0e0e", color: "#f5f5f5" },
  card: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 16,
  },
  cardFlat: {
    background: "#161616",
    border: "1px solid #1f1f1f",
    borderRadius: 12,
  },
  muted: "#737373",
  mutedDark: "#404040",
  amber: "#f59e0b",
  amberDim: "#2a1f00",
  surface: "#1f1f1f",
  surface2: "#252525",
  green: "#22c55e",
  greenDim: "#0f2a1a",
} as const;

// ─── Exercise Pool ────────────────────────────────────────────────────────────
type ExType = "weighted" | "bodyweight" | "duration";
interface ExDef {
  name: string;
  type: ExType;
  profile: string[];
  level: string[];
  equipment?: string[];
}

const EXERCISES: Record<string, ExDef[]> = {
  chest: [
    {
      name: "Bench Press",
      type: "weighted",
      profile: ["compound", "push", "horizontal", "strength"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Incline Bench Press",
      type: "weighted",
      profile: ["compound", "push", "incline"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Decline Bench Press",
      type: "weighted",
      profile: ["compound", "push", "decline"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Dumbbell Press",
      type: "weighted",
      profile: ["compound", "push", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Incline Dumbbell Press",
      type: "weighted",
      profile: ["compound", "push", "incline"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Dumbbell Fly",
      type: "weighted",
      profile: ["isolation", "fly", "stretch"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Cable Fly",
      type: "weighted",
      profile: ["isolation", "fly", "cable"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Cable Crossover",
      type: "weighted",
      profile: ["isolation", "fly", "cable", "squeeze"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Pec Deck",
      type: "weighted",
      profile: ["isolation", "fly", "machine"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Low Cable Fly",
      type: "weighted",
      profile: ["isolation", "fly", "cable"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Hex Press",
      type: "weighted",
      profile: ["isolation", "squeeze"],
      level: ["intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Floor Press",
      type: "weighted",
      profile: ["compound", "push", "horizontal"],
      level: ["intermediate", "advanced"],
      equipment: ["home_gym", "full_gym"],
    },
    {
      name: "Push Up",
      type: "bodyweight",
      profile: ["compound", "push", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Diamond Push Up",
      type: "bodyweight",
      profile: ["compound", "push", "close"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Chest Dip",
      type: "bodyweight",
      profile: ["compound", "push", "decline"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Wide Push Up",
      type: "bodyweight",
      profile: ["compound", "push", "wide"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Pause Bench Press",
      type: "weighted",
      profile: ["compound", "push", "strength"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Dumbbell Pullover",
      type: "weighted",
      profile: ["compound", "stretch"],
      level: ["intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
  ],
  back: [
    {
      name: "Deadlift",
      type: "weighted",
      profile: ["compound", "hinge", "posterior", "strength"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Barbell Row",
      type: "weighted",
      profile: ["compound", "pull", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Dumbbell Row",
      type: "weighted",
      profile: ["compound", "pull", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Single Arm Dumbbell Row",
      type: "weighted",
      profile: ["compound", "pull", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Lat Pulldown",
      type: "weighted",
      profile: ["compound", "pull", "vertical"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Wide Grip Lat Pulldown",
      type: "weighted",
      profile: ["compound", "pull", "vertical"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Seated Cable Row",
      type: "weighted",
      profile: ["compound", "pull", "horizontal", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "T-Bar Row",
      type: "weighted",
      profile: ["compound", "pull", "horizontal"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Chest Supported Row",
      type: "weighted",
      profile: ["compound", "pull", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["home_gym", "full_gym"],
    },
    {
      name: "Face Pull",
      type: "weighted",
      profile: ["isolation", "pull", "rear"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Romanian Deadlift",
      type: "weighted",
      profile: ["compound", "hinge", "posterior"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Rack Pull",
      type: "weighted",
      profile: ["compound", "hinge", "strength"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Good Morning",
      type: "weighted",
      profile: ["compound", "hinge", "posterior"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Barbell Shrug",
      type: "weighted",
      profile: ["isolation", "trap"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Straight Arm Pulldown",
      type: "weighted",
      profile: ["isolation", "pull", "vertical"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Pull Up",
      type: "bodyweight",
      profile: ["compound", "pull", "vertical"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Chin Up",
      type: "bodyweight",
      profile: ["compound", "pull", "vertical"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Inverted Row",
      type: "bodyweight",
      profile: ["compound", "pull", "horizontal"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Australian Pull Up",
      type: "bodyweight",
      profile: ["compound", "pull", "horizontal"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Hyperextension",
      type: "weighted",
      profile: ["compound", "hinge", "posterior"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym", "home_gym"],
    },
  ],
  shoulders: [
    {
      name: "Overhead Press",
      type: "weighted",
      profile: ["compound", "push", "vertical", "strength"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Dumbbell Shoulder Press",
      type: "weighted",
      profile: ["compound", "push", "vertical"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Arnold Press",
      type: "weighted",
      profile: ["compound", "push", "vertical", "rotation"],
      level: ["intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Seated Dumbbell Press",
      type: "weighted",
      profile: ["compound", "push", "vertical"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Machine Shoulder Press",
      type: "weighted",
      profile: ["compound", "push", "vertical", "machine"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Push Press",
      type: "weighted",
      profile: ["compound", "push", "power"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Lateral Raise",
      type: "weighted",
      profile: ["isolation", "medial"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Cable Lateral Raise",
      type: "weighted",
      profile: ["isolation", "medial", "cable"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Front Raise",
      type: "weighted",
      profile: ["isolation", "anterior"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Rear Delt Fly",
      type: "weighted",
      profile: ["isolation", "posterior"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Bent Over Lateral Raise",
      type: "weighted",
      profile: ["isolation", "posterior"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Face Pull",
      type: "weighted",
      profile: ["isolation", "posterior", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Rope Face Pull",
      type: "weighted",
      profile: ["isolation", "posterior", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Upright Row",
      type: "weighted",
      profile: ["compound", "pull", "medial"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Landmine Press",
      type: "weighted",
      profile: ["compound", "push", "incline"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym", "home_gym"],
    },
    {
      name: "Pike Push Up",
      type: "bodyweight",
      profile: ["compound", "push", "vertical"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Handstand Push Up",
      type: "bodyweight",
      profile: ["compound", "push", "vertical"],
      level: ["advanced"],
    },
    {
      name: "Prone Rear Delt Raise",
      type: "weighted",
      profile: ["isolation", "posterior"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
  ],
  arms: [
    {
      name: "Barbell Curl",
      type: "weighted",
      profile: ["isolation", "biceps"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Dumbbell Curl",
      type: "weighted",
      profile: ["isolation", "biceps"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Hammer Curl",
      type: "weighted",
      profile: ["isolation", "biceps", "brachialis"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Incline Dumbbell Curl",
      type: "weighted",
      profile: ["isolation", "biceps", "stretch"],
      level: ["intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "EZ Bar Curl",
      type: "weighted",
      profile: ["isolation", "biceps"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["home_gym", "full_gym"],
    },
    {
      name: "Preacher Curl",
      type: "weighted",
      profile: ["isolation", "biceps", "peak"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Cable Curl",
      type: "weighted",
      profile: ["isolation", "biceps", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Concentration Curl",
      type: "weighted",
      profile: ["isolation", "biceps", "peak"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Zottman Curl",
      type: "weighted",
      profile: ["isolation", "biceps", "brachialis"],
      level: ["intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Tricep Pushdown",
      type: "weighted",
      profile: ["isolation", "triceps", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Skull Crusher",
      type: "weighted",
      profile: ["isolation", "triceps"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Overhead Tricep Extension",
      type: "weighted",
      profile: ["isolation", "triceps", "stretch"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Close Grip Bench Press",
      type: "weighted",
      profile: ["compound", "triceps", "strength"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Tricep Kickback",
      type: "weighted",
      profile: ["isolation", "triceps"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "JM Press",
      type: "weighted",
      profile: ["compound", "triceps"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Diamond Push Up",
      type: "bodyweight",
      profile: ["compound", "triceps"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Dip",
      type: "bodyweight",
      profile: ["compound", "triceps"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Bench Dip",
      type: "bodyweight",
      profile: ["compound", "triceps"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Chin Up",
      type: "bodyweight",
      profile: ["compound", "biceps"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Reverse Curl",
      type: "weighted",
      profile: ["isolation", "brachialis", "forearm"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Wrist Curl",
      type: "weighted",
      profile: ["isolation", "forearm"],
      level: ["beginner", "intermediate", "advanced"],
    },
  ],
  legs: [
    {
      name: "Squat",
      type: "weighted",
      profile: ["compound", "quad", "strength"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Front Squat",
      type: "weighted",
      profile: ["compound", "quad"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Box Squat",
      type: "weighted",
      profile: ["compound", "quad", "strength"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Goblet Squat",
      type: "weighted",
      profile: ["compound", "quad"],
      level: ["beginner", "intermediate"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Bulgarian Split Squat",
      type: "weighted",
      profile: ["compound", "quad", "unilateral"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Dumbbell Bulgarian Split Squat",
      type: "weighted",
      profile: ["compound", "quad", "unilateral"],
      level: ["intermediate", "advanced"],
      equipment: ["dumbbells", "home_gym", "full_gym"],
    },
    {
      name: "Leg Press",
      type: "weighted",
      profile: ["compound", "quad", "machine"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Hack Squat",
      type: "weighted",
      profile: ["compound", "quad", "machine"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Lunge",
      type: "weighted",
      profile: ["compound", "quad", "unilateral"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Walking Lunge",
      type: "weighted",
      profile: ["compound", "quad", "unilateral"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Reverse Lunge",
      type: "weighted",
      profile: ["compound", "quad", "unilateral"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Step Up",
      type: "weighted",
      profile: ["compound", "quad", "unilateral"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Romanian Deadlift",
      type: "weighted",
      profile: ["compound", "hamstring", "hinge"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Stiff Leg Deadlift",
      type: "weighted",
      profile: ["compound", "hamstring", "hinge"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Good Morning",
      type: "weighted",
      profile: ["compound", "hamstring", "hinge"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Nordic Curl",
      type: "bodyweight",
      profile: ["compound", "hamstring"],
      level: ["advanced"],
    },
    {
      name: "Leg Curl",
      type: "weighted",
      profile: ["isolation", "hamstring", "machine"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Leg Extension",
      type: "weighted",
      profile: ["isolation", "quad", "machine"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Hip Thrust",
      type: "weighted",
      profile: ["compound", "glute"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Single Leg Hip Thrust",
      type: "weighted",
      profile: ["compound", "glute", "unilateral"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Glute Bridge",
      type: "weighted",
      profile: ["compound", "glute"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Single Leg Deadlift",
      type: "weighted",
      profile: ["compound", "hamstring", "unilateral"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Calf Raise",
      type: "weighted",
      profile: ["isolation", "calf"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Seated Calf Raise",
      type: "weighted",
      profile: ["isolation", "calf"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Single Leg Calf Raise",
      type: "weighted",
      profile: ["isolation", "calf", "unilateral"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Pistol Squat",
      type: "bodyweight",
      profile: ["compound", "quad", "unilateral"],
      level: ["advanced"],
    },
    {
      name: "Bodyweight Squat",
      type: "bodyweight",
      profile: ["compound", "quad"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Donkey Kick",
      type: "bodyweight",
      profile: ["isolation", "glute"],
      level: ["beginner", "intermediate"],
    },
  ],
  core: [
    {
      name: "Plank",
      type: "duration",
      profile: ["stability", "anti-extension"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Side Plank",
      type: "duration",
      profile: ["stability", "anti-lateral"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Hollow Hold",
      type: "duration",
      profile: ["stability", "anti-extension"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Bird Dog",
      type: "duration",
      profile: ["stability", "compound"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Dead Bug",
      type: "bodyweight",
      profile: ["stability", "anti-extension"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Crunch",
      type: "bodyweight",
      profile: ["isolation", "flexion"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Reverse Crunch",
      type: "bodyweight",
      profile: ["isolation", "flexion", "lower"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Leg Raise",
      type: "bodyweight",
      profile: ["compound", "flexion", "lower"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Hanging Leg Raise",
      type: "bodyweight",
      profile: ["compound", "flexion", "lower"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Hanging Knee Raise",
      type: "bodyweight",
      profile: ["compound", "flexion", "lower"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Bicycle Crunch",
      type: "bodyweight",
      profile: ["compound", "flexion", "rotation"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Russian Twist",
      type: "bodyweight",
      profile: ["compound", "rotation"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "V Up",
      type: "bodyweight",
      profile: ["compound", "flexion"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Toes to Bar",
      type: "bodyweight",
      profile: ["compound", "flexion", "lower"],
      level: ["advanced"],
    },
    {
      name: "Ab Wheel Rollout",
      type: "bodyweight",
      profile: ["compound", "anti-extension"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Dragon Flag",
      type: "bodyweight",
      profile: ["compound", "anti-extension"],
      level: ["advanced"],
    },
    {
      name: "Cable Crunch",
      type: "weighted",
      profile: ["isolation", "flexion", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Pallof Press",
      type: "weighted",
      profile: ["compound", "anti-rotation", "cable"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Cable Wood Chop",
      type: "weighted",
      profile: ["compound", "rotation", "cable"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Suitcase Carry",
      type: "weighted",
      profile: ["compound", "anti-lateral"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Turkish Get Up",
      type: "weighted",
      profile: ["compound", "stability"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Weighted Russian Twist",
      type: "weighted",
      profile: ["compound", "rotation"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "L Sit",
      type: "duration",
      profile: ["stability", "compression"],
      level: ["advanced"],
    },
    {
      name: "Hollow Body Rock",
      type: "bodyweight",
      profile: ["compound", "anti-extension"],
      level: ["intermediate", "advanced"],
    },
  ],
  cardio: [
    {
      name: "Treadmill Run",
      type: "duration",
      profile: ["aerobic", "low-impact"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Cycling",
      type: "duration",
      profile: ["aerobic", "low-impact"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Jump Rope",
      type: "duration",
      profile: ["aerobic", "high-impact"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Rowing Machine",
      type: "duration",
      profile: ["aerobic", "full-body"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Stair Climber",
      type: "duration",
      profile: ["aerobic", "legs"],
      level: ["beginner", "intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Assault Bike",
      type: "duration",
      profile: ["anaerobic", "full-body"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Battle Ropes",
      type: "duration",
      profile: ["anaerobic", "upper"],
      level: ["intermediate", "advanced"],
      equipment: ["full_gym"],
    },
    {
      name: "Sprint",
      type: "duration",
      profile: ["anaerobic", "high-impact"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "High Knees",
      type: "duration",
      profile: ["aerobic", "high-impact"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Jumping Jack",
      type: "duration",
      profile: ["aerobic", "full-body"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Mountain Climber",
      type: "duration",
      profile: ["anaerobic", "core"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Bear Crawl",
      type: "duration",
      profile: ["aerobic", "full-body"],
      level: ["beginner", "intermediate", "advanced"],
    },
    {
      name: "Burpee",
      type: "bodyweight",
      profile: ["anaerobic", "full-body"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Box Jump",
      type: "bodyweight",
      profile: ["anaerobic", "power"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Kettlebell Swing",
      type: "weighted",
      profile: ["anaerobic", "posterior", "power"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Jumping Lunge",
      type: "bodyweight",
      profile: ["anaerobic", "legs", "power"],
      level: ["intermediate", "advanced"],
    },
    {
      name: "Incline Treadmill Walk",
      type: "duration",
      profile: ["aerobic", "low-impact"],
      level: ["beginner", "intermediate"],
    },
    {
      name: "Treadmill Walk",
      type: "duration",
      profile: ["aerobic", "low-impact"],
      level: ["beginner"],
    },
  ],
};

// ─── Generator Engine ─────────────────────────────────────────────────────────
interface GoalConfig {
  sets: [number, number];
  repsMin: number;
  repsMax: number;
  restSec: number;
  increment: Record<ExType, number>;
  preferProfiles: string[];
  exerciseCount: [number, number];
  rpe: number;
  hint: string;
}

const GOAL_CONFIG: Record<string, GoalConfig> = {
  hypertrophy: {
    sets: [3, 4],
    repsMin: 8,
    repsMax: 15,
    restSec: 90,
    increment: { weighted: 2.5, bodyweight: 0, duration: 0 },
    preferProfiles: ["isolation", "stretch", "squeeze", "fly"],
    exerciseCount: [5, 6],
    rpe: 7,
    hint: "Moderate weight · higher reps · short rest to maximise muscle tension.",
  },
  strength: {
    sets: [4, 5],
    repsMin: 3,
    repsMax: 6,
    restSec: 180,
    increment: { weighted: 5, bodyweight: 0, duration: 0 },
    preferProfiles: ["compound", "strength", "hinge", "push", "pull"],
    exerciseCount: [4, 5],
    rpe: 9,
    hint: "Heavy loads · low reps · long rest to maximise neural drive.",
  },
  endurance: {
    sets: [3, 4],
    repsMin: 15,
    repsMax: 25,
    restSec: 45,
    increment: { weighted: 1.25, bodyweight: 0, duration: 0 },
    preferProfiles: ["compound", "aerobic", "full-body"],
    exerciseCount: [5, 6],
    rpe: 6,
    hint: "High reps · lighter load · minimal rest for stamina and conditioning.",
  },
  fat_loss: {
    sets: [3, 4],
    repsMin: 12,
    repsMax: 20,
    restSec: 60,
    increment: { weighted: 1.25, bodyweight: 0, duration: 0 },
    preferProfiles: ["compound", "full-body", "power", "anaerobic"],
    exerciseCount: [5, 7],
    rpe: 7,
    hint: "Compound-heavy circuit · elevated heart rate · caloric burn focus.",
  },
  maintenance: {
    sets: [3, 3],
    repsMin: 8,
    repsMax: 12,
    restSec: 90,
    increment: { weighted: 2.5, bodyweight: 0, duration: 0 },
    preferProfiles: ["compound", "push", "pull", "hinge"],
    exerciseCount: [4, 5],
    rpe: 6,
    hint: "Balanced volume across compound and accessory movements.",
  },
};

const LEVEL_ACCESS: Record<string, string[]> = {
  beginner: ["beginner"],
  intermediate: ["beginner", "intermediate"],
  advanced: ["beginner", "intermediate", "advanced"],
};
const LEVEL_SETS_MOD: Record<string, number> = {
  beginner: -1,
  intermediate: 0,
  advanced: 1,
};

const EQUIPMENT_TYPES: Record<string, ExType[]> = {
  full_gym: ["weighted", "bodyweight", "duration"],
  home_gym: ["weighted", "bodyweight", "duration"],
  dumbbells: ["weighted", "bodyweight", "duration"],
  bodyweight: ["bodyweight", "duration"],
};

const COACH_NOTES: Record<string, string> = {
  "Bench Press":
    "Retract shoulder blades · drive feet into the floor for full-body tension.",
  Deadlift: "Brace hard before the pull · neutral spine throughout.",
  Squat: "Break hips and knees together · keep chest tall.",
  "Overhead Press":
    "Lock out at top · squeeze glutes to protect the lower back.",
  "Pull Up": "Dead-hang at the bottom for full lat stretch every rep.",
  "Romanian Deadlift":
    "Feel the hamstring stretch at the bottom · control the eccentric.",
  "Hip Thrust": "Drive through heels · squeeze glutes hard at the top.",
  "Lateral Raise": "Lead with elbows · slight forward lean · avoid shrugging.",
  Plank: "Squeeze glutes, quads and lats — don't just hold still.",
  "Cable Fly": "Slight elbow bend throughout · focus on chest squeeze at peak.",
  "Bulgarian Split Squat":
    "Front foot far enough forward so knee tracks over mid-foot.",
  "Face Pull": "External-rotate at the top · elbows flare back and out.",
  "Ab Wheel Rollout":
    "Start on knees · go only as far as you hold neutral spine.",
  Burpee: "Strong plank in the down phase · explosive jump at the top.",
  "Pallof Press": "No rotation — resist the cable pull the entire set.",
  "Tricep Pushdown": "Keep elbows pinned to sides · fully extend to lockout.",
  "Barbell Curl": "No swinging · upper arms stay stationary throughout.",
  "Nordic Curl": "Resist the descent with maximum effort · catch if needed.",
  "Battle Ropes": "Hips low · core braced · full amplitude waves.",
  "Hanging Leg Raise":
    "Avoid swinging · initiate with hip flexors not momentum.",
};

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface GeneratedExercise {
  id: string;
  name: string;
  type: ExType;
  order: number;
  targetSets: number;
  targetRepsMin: number;
  targetRepsMax: number;
  incrementKg: number;
  rpe: number;
  coachNote: string;
}

interface GeneratedRoutine {
  exercises: GeneratedExercise[];
  hint: string;
  restBetweenSets: string;
  estimatedDuration: string;
}

function generateRoutine(
  muscleGroup: string,
  goal: string,
  level: string,
  equipment: string,
): GeneratedRoutine | null {
  const gc = GOAL_CONFIG[goal];
  if (!gc) return null;

  const allowedTypes = EQUIPMENT_TYPES[equipment] ?? EQUIPMENT_TYPES.full_gym;
  const levelAccess = LEVEL_ACCESS[level] ?? LEVEL_ACCESS.intermediate;
  const setsMod = LEVEL_SETS_MOD[level] ?? 0;

  const pool = (EXERCISES[muscleGroup] ?? []).filter((ex) => {
    const levelOk = ex.level.some((l) => levelAccess.includes(l));
    const typeOk = allowedTypes.includes(ex.type);
    const equipOk =
      !ex.equipment ||
      ex.equipment.includes(equipment) ||
      equipment === "full_gym";
    return levelOk && typeOk && equipOk;
  });

  if (pool.length === 0) return null;

  // Score
  const scored = pool.map((ex) => ({
    ...ex,
    _score:
      (ex.profile?.filter((p) => gc.preferProfiles.includes(p)).length ?? 0) *
        3 +
      (!ex.equipment ? 1 : ex.equipment.includes(equipment) ? 2 : 0) +
      Math.random() * 1.5,
  }));
  scored.sort((a, b) => b._score - a._score);

  const [minEx, maxEx] = gc.exerciseCount;
  const targetCount = Math.min(
    pool.length,
    minEx + Math.floor(Math.random() * (maxEx - minEx + 1)),
  );

  // Pick with profile diversity
  const topHalf = scored.slice(0, Math.ceil(scored.length * 0.55));
  const candidates = [...topHalf, ...shuffle(scored.slice(topHalf.length))];
  const selected: typeof scored = [];
  const profileCount: Record<string, number> = {};
  for (const ex of candidates) {
    if (selected.length >= targetCount) break;
    const key = ex.profile?.[0] ?? "misc";
    profileCount[key] = (profileCount[key] ?? 0) + 1;
    if (profileCount[key] <= 2) selected.push(ex);
  }
  while (selected.length < Math.min(minEx, pool.length)) {
    const fill = candidates.find((e) => !selected.includes(e));
    if (fill) selected.push(fill);
    else break;
  }

  const [minSets, maxSets] = gc.sets;
  const baseSets =
    minSets + Math.floor(Math.random() * (maxSets - minSets + 1));

  const exercises: GeneratedExercise[] = selected.map((ex, i) => {
    const sets = Math.max(
      1,
      baseSets +
        setsMod +
        (i < 2 && ex.profile?.includes("compound") && goal === "strength"
          ? 1
          : 0),
    );
    const isDuration = ex.type === "duration";
    let rMin = gc.repsMin,
      rMax = gc.repsMax;
    if (isDuration) {
      rMin =
        goal === "strength"
          ? 20
          : goal === "endurance" || goal === "fat_loss"
            ? 40
            : 30;
      rMax =
        goal === "strength"
          ? 30
          : goal === "endurance" || goal === "fat_loss"
            ? 60
            : 45;
    }
    return {
      id: uid(),
      name: ex.name,
      type: ex.type,
      order: i + 1,
      targetSets: sets,
      targetRepsMin: rMin,
      targetRepsMax: rMax,
      incrementKg: ex.type === "weighted" ? gc.increment.weighted : 0,
      rpe: gc.rpe,
      coachNote:
        COACH_NOTES[ex.name] ??
        "Focus on controlled form and full range of motion.",
    };
  });

  const totalSets = exercises.reduce((s, e) => s + e.targetSets, 0);
  const estMin = Math.round(totalSets * (1.5 + gc.restSec / 60));

  return {
    exercises,
    hint: gc.hint,
    restBetweenSets: `${gc.restSec}s rest`,
    estimatedDuration: `${estMin - 5}–${estMin + 5} min`,
  };
}

// ─── UI Config ────────────────────────────────────────────────────────────────
const MUSCLE_GROUPS = [
  "chest",
  "back",
  "shoulders",
  "arms",
  "legs",
  "core",
  "cardio",
] as const;
const GOALS = [
  { id: "hypertrophy", label: "Hypertrophy", sub: "Size & pump" },
  { id: "strength", label: "Strength", sub: "Raw power" },
  { id: "endurance", label: "Endurance", sub: "Stamina" },
  { id: "fat_loss", label: "Fat Loss", sub: "Shred" },
  { id: "maintenance", label: "Maintenance", sub: "Stay in shape" },
];
const LEVELS = [
  { id: "beginner", label: "Beginner", sub: "< 1 yr" },
  { id: "intermediate", label: "Intermediate", sub: "1–3 yr" },
  { id: "advanced", label: "Advanced", sub: "3+ yr" },
];
const EQUIPMENT = [
  { id: "full_gym", label: "Full Gym" },
  { id: "home_gym", label: "Home Gym" },
  { id: "dumbbells", label: "Dumbbells" },
  { id: "bodyweight", label: "Bodyweight" },
];

const TYPE_COLORS: Record<ExType, { bg: string; text: string }> = {
  weighted: { bg: "#1a2a0a", text: "#86efac" },
  bodyweight: { bg: "#0a1a2a", text: "#7dd3fc" },
  duration: { bg: "#2a1a0a", text: "#fcd34d" },
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <p
        className="text-xs font-medium tracking-widest uppercase"
        style={{ color: S.muted }}
      >
        {label}
      </p>
      {children}
    </div>
  );
}

function OptionPill({
  label,
  sub,
  active,
  onClick,
}: {
  label: string;
  sub?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-left transition-all"
      style={{
        background: active ? S.amberDim : S.surface,
        border: `1px solid ${active ? S.amber : "transparent"}`,
        color: active ? S.amber : "#f5f5f5",
      }}
    >
      <span className="text-sm font-medium">{label}</span>
      {sub && (
        <span
          className="text-xs"
          style={{ color: active ? "#a16207" : S.muted }}
        >
          {sub}
        </span>
      )}
    </button>
  );
}

function GridPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl px-3 py-2 text-sm font-medium transition-all"
      style={{
        background: active ? S.amberDim : S.surface,
        border: `1px solid ${active ? S.amber : "transparent"}`,
        color: active ? S.amber : "#f5f5f5",
      }}
    >
      {label}
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function RouteComponent() {
  const router = useRouter();
  const scheduleId = Route.useParams().scheduleId;

  const [muscleGroup, setMuscleGroup] = useState<string>("chest");
  const [goal, setGoal] = useState("hypertrophy");
  const [level, setLevel] = useState("intermediate");
  const [equipment, setEquipment] = useState("full_gym");
  const [routine, setRoutine] = useState<GeneratedRoutine | null>(null);
  const [saved, setSaved] = useState(false);

  const generate = useCallback(() => {
    setSaved(false);
    const result = generateRoutine(muscleGroup, goal, level, equipment);
    setRoutine(result);
  }, [muscleGroup, goal, level, equipment]);

  const handleSave = () => {
    if (!routine) return;
    const now = Date.now();
    routine.exercises.forEach((ex) => {
      store.setRow("exercises", ex.id, {
        scheduleId,
        name: ex.name,
        type: ex.type,
        order: ex.order,
        targetSets: ex.targetSets,
        targetRepsMin: ex.targetRepsMin,
        targetRepsMax: ex.targetRepsMax,
        incrementKg: ex.incrementKg,
        rpe: ex.rpe,
        createdAt: now,
        completed: 0,
      });
    });
    setSaved(true);
  };

  const handleRegen = () => {
    setSaved(false);
    const result = generateRoutine(muscleGroup, goal, level, equipment);
    setRoutine(result);
  };

  return (
    <div style={S.page} className="min-h-screen">
      <Header showBack title="AI Routine" subtitle="Generate a workout" />

      <div className="space-y-5 px-4 pt-20 pb-32">
        {/* ── Config card ── */}
        <div style={S.card} className="space-y-5 p-4">
          {/* Muscle group */}
          <Section label="Muscle Group">
            <div className="flex flex-wrap gap-2">
              {MUSCLE_GROUPS.map((mg) => (
                <GridPill
                  key={mg}
                  label={mg.charAt(0).toUpperCase() + mg.slice(1)}
                  active={muscleGroup === mg}
                  onClick={() => {
                    setMuscleGroup(mg);
                    setRoutine(null);
                    setSaved(false);
                  }}
                />
              ))}
            </div>
          </Section>

          {/* Goal */}
          <Section label="Goal">
            <div className="space-y-1.5">
              {GOALS.map((g) => (
                <OptionPill
                  key={g.id}
                  label={g.label}
                  sub={g.sub}
                  active={goal === g.id}
                  onClick={() => setGoal(g.id)}
                />
              ))}
            </div>
          </Section>

          {/* Level */}
          <Section label="Experience Level">
            <div className="flex gap-2">
              {LEVELS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => setLevel(l.id)}
                  className="flex-1 rounded-xl px-2 py-2.5 text-center transition-all"
                  style={{
                    background: level === l.id ? S.amberDim : S.surface,
                    border: `1px solid ${level === l.id ? S.amber : "transparent"}`,
                    color: level === l.id ? S.amber : "#f5f5f5",
                  }}
                >
                  <p className="text-sm font-medium">{l.label}</p>
                  <p
                    className="mt-0.5 text-xs"
                    style={{ color: level === l.id ? "#a16207" : S.muted }}
                  >
                    {l.sub}
                  </p>
                </button>
              ))}
            </div>
          </Section>

          {/* Equipment */}
          <Section label="Equipment">
            <div className="flex flex-wrap gap-2">
              {EQUIPMENT.map((eq) => (
                <GridPill
                  key={eq.id}
                  label={eq.label}
                  active={equipment === eq.id}
                  onClick={() => setEquipment(eq.id)}
                />
              ))}
            </div>
          </Section>
        </div>

        {/* ── Generate button ── */}
        <button
          onClick={generate}
          className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-opacity active:opacity-80"
          style={{ background: S.amber, color: "#0e0e0e" }}
        >
          <Zap size={16} />
          Generate Routine
        </button>

        {/* ── Result ── */}
        {routine && (
          <div className="space-y-3">
            {/* Meta row */}
            <div
              style={S.card}
              className="flex items-center justify-between gap-3 p-3"
            >
              <div className="space-y-0.5">
                <p className="text-sm font-semibold">
                  {routine.exercises.length} exercises
                  <span style={{ color: S.mutedDark }}> · </span>
                  {routine.exercises.reduce((s, e) => s + e.targetSets, 0)} sets
                </p>
                <p className="text-xs" style={{ color: S.muted }}>
                  ~{routine.estimatedDuration} · {routine.restBetweenSets}
                </p>
              </div>
              <button
                onClick={handleRegen}
                className="flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-medium transition-colors"
                style={{ background: S.surface, color: S.muted }}
              >
                <Shuffle size={12} />
                Regenerate
              </button>
            </div>

            {/* Hint */}
            <div
              className="rounded-2xl px-4 py-3"
              style={{ background: S.amberDim, border: `1px solid #3a2500` }}
            >
              <p
                className="text-xs leading-relaxed"
                style={{ color: "#d97706" }}
              >
                {routine.hint}
              </p>
            </div>

            {/* Exercise list */}
            <div style={S.card} className="overflow-hidden">
              {routine.exercises.map((ex, i) => {
                const tc = TYPE_COLORS[ex.type];
                const isDuration = ex.type === "duration";
                return (
                  <div
                    key={ex.id}
                    className="flex items-center gap-3 px-4 py-3"
                    style={{
                      borderBottom:
                        i < routine.exercises.length - 1
                          ? `1px solid ${S.surface}`
                          : "none",
                    }}
                  >
                    {/* Order */}
                    <span
                      className="w-5 shrink-0 text-right text-xs font-bold tabular-nums"
                      style={{ color: S.mutedDark }}
                    >
                      {i + 1}
                    </span>

                    {/* Info */}
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <p className="truncate text-sm font-medium">{ex.name}</p>
                      <p
                        className="text-xs leading-relaxed"
                        style={{ color: S.muted }}
                      >
                        {ex.coachNote}
                      </p>
                    </div>

                    {/* Right side */}
                    <div className="shrink-0 space-y-1 text-right">
                      <p
                        className="text-sm font-semibold"
                        style={{ color: S.amber }}
                      >
                        {ex.targetSets} ×{" "}
                        {isDuration
                          ? `${ex.targetRepsMin}–${ex.targetRepsMax}s`
                          : `${ex.targetRepsMin}–${ex.targetRepsMax}`}
                      </p>
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
                        style={{ background: tc.bg, color: tc.text }}
                      >
                        {ex.type}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Save / Done */}
            {!saved ? (
              <button
                onClick={handleSave}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-opacity active:opacity-80"
                style={{ background: S.green, color: "#0e0e0e" }}
              >
                Add to Schedule
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                onClick={() => router.history.back()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold transition-opacity active:opacity-80"
                style={{
                  background: S.greenDim,
                  border: `1px solid ${S.green}`,
                  color: S.green,
                }}
              >
                <CheckCircle2 size={16} />
                Saved — tap to go back
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
