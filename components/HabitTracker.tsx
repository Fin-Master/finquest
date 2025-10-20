
import React, { useMemo } from 'react';
import { Flame, Trophy, CheckCircle } from 'lucide-react';

interface HabitTrackerProps {
  activityLog: string[]; // Array of date strings 'YYYY-MM-DD'
  onNilCheckIn: () => void;
}

const HabitTracker: React.FC<HabitTrackerProps> = ({ activityLog, onNilCheckIn }) => {
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  const { currentStreak, longestStreak, hasCheckedInToday } = useMemo(() => {
    if (activityLog.length === 0) {
      return { currentStreak: 0, longestStreak: 0, hasCheckedInToday: false };
    }

    const sortedTimestamps = [...new Set(activityLog)]
      .map(dateStr => new Date(dateStr + 'T00:00:00').getTime())
      .sort((a, b) => a - b);
    
    let current = 0;
    let longest = 0;
    
    if (sortedTimestamps.length > 0) {
        longest = 1;
        current = 1;
        for (let i = 1; i < sortedTimestamps.length; i++) {
            const diff = sortedTimestamps[i] - sortedTimestamps[i-1];
            if (diff === ONE_DAY_MS) {
                current++;
            } else {
                current = 1; // Reset if the streak is broken
            }
            longest = Math.max(longest, current);
        }
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();
    
    const lastCheckinTimestamp = sortedTimestamps[sortedTimestamps.length - 1];
    
    let finalCurrentStreak = 0;
    const localHasCheckedInToday = lastCheckinTimestamp === todayTimestamp;

    // Calculate current streak ending today or yesterday
    if (localHasCheckedInToday) {
        finalCurrentStreak = 1;
        for (let i = sortedTimestamps.length - 2; i >= 0; i--) {
            if (sortedTimestamps[i+1] - sortedTimestamps[i] === ONE_DAY_MS) {
                finalCurrentStreak++;
            } else {
                break;
            }
        }
    } else {
        const yesterdayTimestamp = todayTimestamp - ONE_DAY_MS;
        if (lastCheckinTimestamp === yesterdayTimestamp) {
           // If yesterday was the last checkin, calculate the streak ending yesterday
           finalCurrentStreak = 1;
            for (let i = sortedTimestamps.length - 2; i >= 0; i--) {
                if (sortedTimestamps[i+1] - sortedTimestamps[i] === ONE_DAY_MS) {
                    finalCurrentStreak++;
                } else {
                    break;
                }
            }
        }
        // If the last check-in was before yesterday, the streak is broken.
    }

    return {
      currentStreak: finalCurrentStreak,
      longestStreak: longest,
      hasCheckedInToday: localHasCheckedInToday,
    };
  }, [activityLog, ONE_DAY_MS]);

  return (
    <div id="tour-step-4" className="bg-gray-800/50 p-6 rounded-2xl shadow-lg border border-gray-700">
      <h3 className="text-xl font-bold text-white mb-4">Daily Financial Check-in</h3>
      <div className="flex justify-around items-center mb-6 text-center">
        <div>
          <p className="text-lg text-gray-400">Current Streak</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Flame className="text-orange-400" />
            <p className="text-3xl font-bold text-white">{currentStreak}</p>
          </div>
        </div>
        <div>
          <p className="text-lg text-gray-400">Best Streak</p>
          <div className="flex items-center justify-center gap-2 mt-1">
            <Trophy className="text-yellow-400" />
            <p className="text-3xl font-bold text-white">{longestStreak}</p>
          </div>
        </div>
      </div>
      <button
        onClick={onNilCheckIn}
        disabled={hasCheckedInToday}
        className="w-full flex items-center justify-center bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:text-gray-400"
      >
        {hasCheckedInToday ? (
            <>
                <CheckCircle className="mr-2"/>
                Logged for Today!
            </>
        ) : "Log Nil for Today"}
      </button>
       <p className="text-xs text-gray-500 text-center mt-2">
            Add a transaction or log 'Nil' to maintain your daily streak.
        </p>
    </div>
  );
};

export default HabitTracker;
