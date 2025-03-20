// main.ts

/**
 * A micro:bit extension for controlling servo motors with interactive motion.
 * Set angles, sweep between angles, and stop with Button A—great for student projects!
 */

//% weight=100 color=#ff6347 icon="\uf021" block="ServoSweeper"
//% groups=['Setup', 'Control', 'Motion']
namespace ServoSweeper {
    // Constants for servo control
    const SERVO_PERIOD_MS = 20; // 50Hz = 20ms period
    const MIN_PULSE_MS = 0.5;   // 0 degrees
    const MAX_PULSE_MS = 2.5;   // 180 degrees
    const PULSE_RANGE_MS = MAX_PULSE_MS - MIN_PULSE_MS;
    const ANGLE_RANGE = 180;

    // Servo class to store state
    class Servo {
        private pin: AnalogPin;
        private currentAngle: number;
        private isActive: boolean;

        constructor(pin: AnalogPin) {
            this.pin = pin;
            this.currentAngle = 90; // Start at 90 degrees (neutral position)
            this.isActive = false;
            // Initialize the pin as an analog output
            pins.analogSetPeriod(this.pin, SERVO_PERIOD_MS * 1000); // Period in microseconds
        }

        // Convert angle to pulse width in microseconds
        private angleToPulse(angle: number): number {
            angle = Math.constrain(angle, 0, ANGLE_RANGE);
            const pulseMs = MIN_PULSE_MS + (angle / ANGLE_RANGE) * PULSE_RANGE_MS;
            return Math.round(pulseMs * 1000); // Convert to microseconds
        }

        // Set the servo angle
        setAngle(angle: number): void {
            this.currentAngle = Math.constrain(angle, 0, ANGLE_RANGE);
            const pulseWidth = this.angleToPulse(this.currentAngle);
            pins.servoWritePin(this.pin, pulseWidth);
            this.isActive = true;
        }

        // Sweep between two angles for a specified number of cycles
        sweep(startAngle: number, endAngle: number, speed: number, cycles: number): void {
            startAngle = Math.constrain(startAngle, 0, ANGLE_RANGE);
            endAngle = Math.constrain(endAngle, 0, ANGLE_RANGE);
            speed = Math.constrain(speed, 1, 10); // Speed from 1 (slow) to 10 (fast)
            cycles = Math.max(1, cycles); // Ensure at least 1 cycle

            const delayMs = Math.round(100 / speed); // Adjust delay based on speed
            let step = startAngle < endAngle ? 1 : -1;
            let current = startAngle;
            let cycleCount = 0;
            let forward = true;

            while (cycleCount < cycles) {
                this.setAngle(current);
                basic.pause(delayMs);
                if (forward) {
                    current += step;
                    if (current >= endAngle || current <= startAngle) {
                        forward = false;
                        step = -step;
                        current += step * 2;
                        cycleCount++;
                    }
                } else {
                    current += step;
                    if (current >= endAngle || current <= startAngle) {
                        forward = true;
                        step = -step;
                        current += step * 2;
                    }
                }

                // Stop the sweep if Button A is pressed
                if (input.buttonIsPressed(Button.A)) {
                    break;
                }
            }
        }

        // Stop the servo
        stop(): void {
            pins.analogWritePin(this.pin, 0); // Disable PWM signal
            this.isActive = false;
        }

        // Get the current angle
        getAngle(): number {
            return this.currentAngle;
        }
    }

    // Store servo instances to avoid creating multiple per pin
    let servos: { [key: number]: Servo } = {};

    /**
     * Connect a servo motor to a pin.
     * @param pin The pin to connect the servo to, eg: AnalogPin.P0
     */
    //% block="connect servo to %pin"
    //% group="Setup"
    export function connectServo(pin: AnalogPin): Servo {
        if (!servos[pin]) {
            servos[pin] = new Servo(pin);
        }
        return servos[pin];
    }

    /**
     * Set the servo to a specific angle (0 to 180 degrees).
     * @param servo The servo to control
     * @param angle The angle in degrees, eg: 90
     */
    //% block="set %servo servo to angle %angle °"
    //% angle.min=0 angle.max=180
    //% group="Control"
    export function setAngle(servo: Servo, angle: number): void {
        servo.setAngle(angle);
    }

    /**
     * Sweep the servo between two angles for a number of cycles at a specified speed.
     * Press Button A to stop the sweep.
     * @param servo The servo to control
     * @param startAngle The starting angle, eg: 0
     * @param endAngle The ending angle, eg: 180
     * @param speed The speed of movement (1 to 10), eg: 5
     * @param cycles The number of sweep cycles, eg: 2
     */
    //% block="sweep %servo servo from %startAngle ° to %endAngle ° at speed %speed for %cycles cycles"
    //% startAngle.min=0 startAngle.max=180
    //% endAngle.min=0 endAngle.max=180
    //% speed.min=1 speed.max=10
    //% cycles.min=1 cycles.max=10
    //% group="Motion"
    export function sweep(servo: Servo, startAngle: number, endAngle: number, speed: number, cycles: number): void {
        servo.sweep(startAngle, endAngle, speed, cycles);
    }

    /**
     * Stop the servo motor.
     * @param servo The servo to stop
     */
    //% block="stop %servo servo"
    //% group="Control"
    export function stop(servo: Servo): void {
        servo.stop();
    }

    /**
     * Get the current angle of the servo.
     * @param servo The servo to check
     */
    //% block="get %servo servo angle"
    //% group="Control"
    export function getAngle(servo: Servo): number {
        return servo.getAngle();
    }
}
