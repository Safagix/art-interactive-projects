import { useRef, useEffect, useCallback } from 'react';

/**
 * SVGFollower — Colorful SVG trail that follows cursor movement.
 * Adapted from 21dev SVGFollower to TypeScript for the Nexus Hub.
 */

interface Position {
    x: number;
    y: number;
}

interface Point {
    position: Position;
    time: number;
    drift: Position;
    age: number;
    direction: Position;
}

interface SVGFollowerProps {
    colors?: string[];
    removeDelay?: number;
    className?: string;
}

class Follower {
    private points: Point[] = [];
    private line: SVGPathElement;
    private color: string;
    private stage: SVGSVGElement;
    private removeDelay: number;

    constructor(stage: SVGSVGElement, color: string, removeDelay: number) {
        this.stage = stage;
        this.color = color;
        this.removeDelay = removeDelay;
        this.line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.line.style.fill = color;
        this.line.style.stroke = color;
        this.line.style.strokeWidth = '1';
        this.stage.appendChild(this.line);
    }

    private getDrift(): number {
        return (Math.random() - 0.5) * 3;
    }

    public add(position: Position) {
        const direction = { x: 0, y: 0 };
        if (this.points[0]) {
            direction.x = (position.x - this.points[0].position.x) * 0.25;
            direction.y = (position.y - this.points[0].position.y) * 0.25;
        }

        const point: Point = {
            position,
            time: Date.now(),
            drift: {
                x: this.getDrift() + direction.x / 2,
                y: this.getDrift() + direction.y / 2,
            },
            age: 0,
            direction,
        };

        const shapeChance = Math.random();
        const chance = 0.1;
        if (shapeChance < chance) this.makeCircle(point);
        else if (shapeChance < chance * 2) this.makeSquare(point);
        else if (shapeChance < chance * 3) this.makeTriangle(point);

        this.points.unshift(point);
    }

    private createLine(points: Point[]): string {
        const path: string[] = [points.length ? 'M' : ''];

        if (points.length > 0) {
            let forward = true;
            let i = 0;

            while (i >= 0) {
                const point = points[i];
                const offsetX = point.direction.x * ((i - points.length) / points.length) * 0.6;
                const offsetY = point.direction.y * ((i - points.length) / points.length) * 0.6;
                const x = point.position.x + (forward ? offsetY : -offsetY);
                const y = point.position.y + (forward ? offsetX : -offsetX);
                point.age += 0.2;

                path.push(String(x + point.drift.x * point.age));
                path.push(String(y + point.drift.y * point.age));

                i += forward ? 1 : -1;
                if (i === points.length) {
                    i--;
                    forward = false;
                }
            }
        }

        return path.join(' ');
    }

    public trim() {
        if (this.points.length > 0) {
            const last = this.points[this.points.length - 1];
            if (last.time < Date.now() - this.removeDelay) {
                this.points.pop();
            }
        }
        this.line.setAttribute('d', this.createLine(this.points));
    }

    private makeCircle(point: Point) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        const radius = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1;
        circle.setAttribute('r', String(radius));
        circle.style.fill = this.color;
        circle.setAttribute('cx', '0');
        circle.setAttribute('cy', '0');
        this.moveShape(circle, point);
    }

    private makeSquare(point: Point) {
        const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5;
        const square = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        square.setAttribute('width', String(size));
        square.setAttribute('height', String(size));
        square.style.fill = this.color;
        this.moveShape(square, point);
    }

    private makeTriangle(point: Point) {
        const size = (Math.abs(point.direction.x) + Math.abs(point.direction.y)) * 1.5;
        const triangle = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        triangle.setAttribute('points', `0,0 ${size},${size / 2} 0,${size}`);
        triangle.style.fill = this.color;
        this.moveShape(triangle, point);
    }

    private moveShape(shape: SVGElement, point: Point) {
        this.stage.appendChild(shape);
        const driftX = point.position.x + point.direction.x * (Math.random() * 20) + point.drift.x * (Math.random() * 10);
        const driftY = point.position.y + point.direction.y * (Math.random() * 20) + point.drift.y * (Math.random() * 10);

        shape.style.transform = `translate(${point.position.x}px, ${point.position.y}px)`;
        shape.style.transition = 'all 0.5s ease-out';

        setTimeout(() => {
            shape.style.transform = `translate(${driftX}px, ${driftY}px) scale(0) rotate(${Math.random() * 360}deg)`;
            setTimeout(() => {
                if (this.stage.contains(shape)) {
                    this.stage.removeChild(shape);
                }
            }, 500);
        }, 10);
    }

    public destroy() {
        if (this.stage.contains(this.line)) {
            this.stage.removeChild(this.line);
        }
    }
}

export function SVGFollower({
    colors = ['#a855f7', '#06b6d4', '#8b5cf6', '#22d3ee', '#ffffff'],
    removeDelay = 400,
    className = '',
}: SVGFollowerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const followersRef = useRef<Follower[]>([]);
    const animationRef = useRef<number>(0);

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const position: Position = { x: e.clientX, y: e.clientY };
        followersRef.current.forEach((f) => f.add(position));
    }, []);

    const handleTouchMove = useCallback((e: TouchEvent) => {
        if (!e.touches[0]) return;
        const position: Position = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        followersRef.current.forEach((f) => f.add(position));
    }, []);

    const animate = useCallback(() => {
        followersRef.current.forEach((f) => f.trim());
        animationRef.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        if (!svgRef.current) return;

        const svgEl = svgRef.current;
        followersRef.current = colors.map((color) => new Follower(svgEl, color, removeDelay));

        animate();

        // Listen on window so trails work even when cursor is over content
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('touchmove', handleTouchMove as any);

        return () => {
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
            followersRef.current.forEach((f) => f.destroy());
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('touchmove', handleTouchMove as any);
        };
    }, [colors, removeDelay, animate, handleMouseMove, handleTouchMove]);

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[1] pointer-events-none ${className}`}
            style={{ width: '100vw', height: '100vh' }}
        >
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
                className="absolute inset-0"
                style={{ overflow: 'visible' }}
            />
        </div>
    );
}
