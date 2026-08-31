<?php

namespace App\Policies;

use App\Models\Notification;
use App\Models\User;

class NotificationPolicy
{
    public function update(User $user, Notification $notification): bool
    {
        return $user->house_id === $notification->house_id;
    }
}