import re

with open('index.html', 'r') as f:
    content = f.read()

new_fix = """<!-- MOBILE TOUCH FIX -->
<script>
document.addEventListener("DOMContentLoaded", () => {
    // Global event delegation for touchstart to fix Android tap issues
    let touched = false;

    document.body.addEventListener("touchstart", function(e) {
        // Find if the target or its ancestors is a button or class-card
        const target = e.target.closest('button, .class-card, .choice-btn, .map-region-node');
        if (!target) return;

        touched = true;

        // Prevent default touch behavior to stop ghost clicks
        e.preventDefault();

        // Programmatically trigger click
        target.click();
    }, { passive: false });

    document.body.addEventListener("click", function(e) {
        if (touched) {
            touched = false;
        }
    });
});
</script>"""

# Find the start of MOBILE TOUCH FIX
start_idx = content.find("<!-- MOBILE TOUCH FIX -->")
end_idx = content.find("</body>")

if start_idx != -1 and end_idx != -1:
    content = content[:start_idx] + new_fix + "\n\n" + content[end_idx:]
    with open('index.html', 'w') as f:
        f.write(content)
    print("Replaced successfully")
else:
    print("Could not find the block")
