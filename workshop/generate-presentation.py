#!/usr/bin/env python3
"""Generate presentation PDF for LTS Workshop 13/02/2026"""

from reportlab.lib.pagesizes import landscape, A4
from reportlab.lib.colors import HexColor, white, Color
from reportlab.lib.units import inch, cm
from reportlab.pdfgen import canvas
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
import os

# Page setup
PAGE_W, PAGE_H = landscape(A4)
MARGIN = 60

# Colors
BG_DARK = HexColor("#0A0A0A")
BG_SECTION = HexColor("#111111")
ACCENT = HexColor("#06B6D4")  # Cyan/teal - matches Hydra
ACCENT_DIM = HexColor("#0891B2")
TEXT_PRIMARY = HexColor("#FAFAFA")
TEXT_SECONDARY = HexColor("#A1A1AA")
TEXT_MUTED = HexColor("#71717A")
RED_ACCENT = HexColor("#EF4444")
GREEN_ACCENT = HexColor("#22C55E")
ORANGE_ACCENT = HexColor("#F97316")
SURFACE = HexColor("#1A1A1A")
SURFACE_LIGHT = HexColor("#262626")
BORDER = HexColor("#333333")


def draw_bg(c, color=BG_DARK):
    c.setFillColor(color)
    c.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)


def draw_footer(c, slide_num, total, section=""):
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(MARGIN, 30, "Leading Tech Session | 13 Fev 2026")
    if section:
        c.drawCentredString(PAGE_W / 2, 30, section)
    c.drawRightString(PAGE_W - MARGIN, 30, f"{slide_num}/{total}")


def draw_accent_line(c, y, width=100):
    c.setStrokeColor(ACCENT)
    c.setLineWidth(3)
    c.line(MARGIN, y, MARGIN + width, y)


def draw_box(c, x, y, w, h, fill=SURFACE, border=None, radius=8):
    c.setFillColor(fill)
    if border:
        c.setStrokeColor(border)
        c.setLineWidth(1)
        c.roundRect(x, y, w, h, radius, fill=1, stroke=1 if border else 0)
    else:
        c.roundRect(x, y, w, h, radius, fill=1, stroke=0)


def wrap_text(c, text, x, y, max_width, font="Helvetica", size=14, color=TEXT_PRIMARY, leading=None):
    """Simple word-wrap text drawing. Returns final y position."""
    if leading is None:
        leading = size * 1.4
    c.setFont(font, size)
    c.setFillColor(color)
    words = text.split()
    lines = []
    current_line = ""
    for word in words:
        test = current_line + " " + word if current_line else word
        if c.stringWidth(test, font, size) <= max_width:
            current_line = test
        else:
            if current_line:
                lines.append(current_line)
            current_line = word
    if current_line:
        lines.append(current_line)
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


TOTAL_SLIDES = 26


def slide_01_title(c):
    """Title slide"""
    draw_bg(c)

    # Subtle top accent line
    c.setStrokeColor(ACCENT)
    c.setLineWidth(2)
    c.line(MARGIN, PAGE_H - 50, PAGE_W - MARGIN, PAGE_H - 50)

    # Main title
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 48)
    c.drawString(MARGIN, PAGE_H - 180, "Upstream:")
    c.drawString(MARGIN, PAGE_H - 240, "A Pr\u00f3xima Fronteira")

    # Subtitle
    c.setFillColor(ACCENT)
    c.setFont("Helvetica", 20)
    c.drawString(MARGIN, PAGE_H - 300, "Context Engineering na pr\u00e1tica \u2014 do experimento ao c\u00f3digo")

    # Flow graphic
    flow_y = PAGE_H - 420
    labels = ["Experiment", "Structure", "Implement"]
    box_w = 160
    gap = 40
    start_x = MARGIN
    for i, label in enumerate(labels):
        x = start_x + i * (box_w + gap)
        draw_box(c, x, flow_y, box_w, 50, fill=SURFACE, border=ACCENT if i == 0 else BORDER)
        c.setFillColor(ACCENT if i == 0 else TEXT_SECONDARY)
        c.setFont("Helvetica", 14)
        c.drawCentredString(x + box_w / 2, flow_y + 18, label)
        if i < 2:
            c.setStrokeColor(TEXT_MUTED)
            c.setLineWidth(1)
            arrow_x = x + box_w + 5
            c.line(arrow_x, flow_y + 25, arrow_x + 30, flow_y + 25)
            c.line(arrow_x + 25, flow_y + 30, arrow_x + 30, flow_y + 25)
            c.line(arrow_x + 25, flow_y + 20, arrow_x + 30, flow_y + 25)

    # Footer
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 11)
    c.drawString(MARGIN, 50, "Leading Tech Session  |  Workshop Pr\u00e1tico  |  13 Fev 2026")


def slide_02_recap(c):
    """Recap: Where we left off"""
    draw_bg(c)
    draw_footer(c, 2, TOTAL_SLIDES, "Opening")

    # Title
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 14)
    c.drawString(MARGIN, PAGE_H - 80, "SESS\u00c3O ANTERIOR")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, PAGE_H - 130, "A matem\u00e1tica n\u00e3o fecha.")

    # Big numbers
    num_y = PAGE_H - 280

    # 88.3%
    draw_box(c, MARGIN, num_y, 300, 120, fill=SURFACE)
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 56)
    c.drawCentredString(MARGIN + 150, num_y + 55, "88.3%")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 13)
    c.drawCentredString(MARGIN + 150, num_y + 20, "Ado\u00e7\u00e3o de ferramentas IA")

    # 32.7%
    draw_box(c, MARGIN + 340, num_y, 300, 120, fill=SURFACE)
    c.setFillColor(RED_ACCENT)
    c.setFont("Helvetica-Bold", 56)
    c.drawCentredString(MARGIN + 340 + 150, num_y + 55, "32.7%")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 13)
    c.drawCentredString(MARGIN + 340 + 150, num_y + 20, "Aceita\u00e7\u00e3o de PRs gerados por IA")

    # Gap arrow
    c.setStrokeColor(ORANGE_ACCENT)
    c.setLineWidth(2)
    gap_x = MARGIN + 310
    c.line(gap_x, num_y + 60, gap_x + 20, num_y + 60)
    c.setFillColor(ORANGE_ACCENT)
    c.setFont("Helvetica-Bold", 16)
    c.drawCentredString(gap_x + 10, num_y + 75, "gap")

    # Bottom statement
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 18)
    c.drawString(MARGIN, num_y - 60, "O problema n\u00e3o \u00e9 a ferramenta.")
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN, num_y - 90, "\u00c9 como a empresa se organiza para us\u00e1-la.")


def slide_03_promise(c):
    """Today's Promise"""
    draw_bg(c)
    draw_footer(c, 3, TOTAL_SLIDES, "Opening")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(MARGIN, PAGE_H - 100, "Hoje, voc\u00eas v\u00e3o ver o loop completo")
    c.drawString(MARGIN, PAGE_H - 140, "acontecendo \u2014 ao vivo.")

    # Three cases
    cases = [
        ("Case 1", "Design Experiment", "Prototipar com guardrails", ACCENT),
        ("Case 2", "Scope Planning", "Do experimento ao backlog", HexColor("#8B5CF6")),
        ("Case 3", "Implementation", "Do backlog ao c\u00f3digo", GREEN_ACCENT),
    ]

    box_w = 220
    gap = 30
    start_x = MARGIN
    box_y = PAGE_H - 340

    for i, (label, title, desc, color) in enumerate(cases):
        x = start_x + i * (box_w + gap)
        draw_box(c, x, box_y, box_w, 150, fill=SURFACE, border=color)

        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(x + 20, box_y + 120, label)

        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica-Bold", 17)
        c.drawString(x + 20, box_y + 90, title)

        c.setFillColor(TEXT_SECONDARY)
        c.setFont("Helvetica", 12)
        c.drawString(x + 20, box_y + 60, desc)

        # Arrow between boxes
        if i < 2:
            arrow_x = x + box_w + 5
            c.setStrokeColor(TEXT_MUTED)
            c.setLineWidth(1)
            c.line(arrow_x, box_y + 75, arrow_x + 20, box_y + 75)

    # Bottom
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Oblique", 16)
    c.drawString(MARGIN, box_y - 50, "Tela compartilhada. Sem slides. Ao vivo.")


def slide_04_signal(c):
    """The Signal - YC"""
    draw_bg(c)
    draw_footer(c, 4, TOTAL_SLIDES, "The Market Signal")

    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 14)
    c.drawString(MARGIN, PAGE_H - 80, "O SINAL QUE O MERCADO EST\u00c1 DANDO")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 38)
    c.drawString(MARGIN, PAGE_H - 170, "A YC est\u00e1 procurando um")

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 44)
    c.drawString(MARGIN, PAGE_H - 230, "\"Cursor for Product Managers\"")

    # Context
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 16)
    y = PAGE_H - 310
    lines = [
        "Temos uma explos\u00e3o de ferramentas de IA para escrever c\u00f3digo.",
        "Cursor, Claude Code, Copilot...",
        "",
        "Mas escrever c\u00f3digo \u00e9 s\u00f3 uma parte.",
    ]
    for line in lines:
        if line:
            c.drawString(MARGIN, y, line)
        y -= 28

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(MARGIN, y - 10, "A parte mais importante \u00e9 descobrir o que construir.")


def slide_05_quote_ym(c):
    """YC Quote"""
    draw_bg(c)
    draw_footer(c, 5, TOTAL_SLIDES, "The Market Signal")

    # Large quote
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 60)
    c.drawString(MARGIN - 5, PAGE_H - 140, "\u201c")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Oblique", 22)
    y = PAGE_H - 180
    lines = [
        "As agents increasingly take the first pass",
        "at implementation, the way we define and",
        "communicate 'what to build' needs to change."
    ]
    for line in lines:
        c.drawString(MARGIN + 20, y, line)
        y -= 34

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 14)
    c.drawString(MARGIN + 20, y - 20, "\u2014 Andrew Miklas, YC")


def slide_06_frontier(c):
    """After Delivery"""
    draw_bg(c)
    draw_footer(c, 6, TOTAL_SLIDES, "The Market Signal")

    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 16)
    c.drawString(MARGIN, PAGE_H - 100, "Resolvemos o delivery.")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 42)
    c.drawString(MARGIN, PAGE_H - 170, "O upstream \u00e9 a")
    c.setFillColor(ACCENT)
    c.drawString(MARGIN, PAGE_H - 225, "pr\u00f3xima fronteira.")

    # Timeline visual
    timeline_y = PAGE_H - 370

    # Delivery (faded)
    draw_box(c, MARGIN, timeline_y, 280, 70, fill=SURFACE)
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(MARGIN + 140, timeline_y + 40, "Delivery")
    c.setFont("Helvetica", 12)
    c.drawCentredString(MARGIN + 140, timeline_y + 15, "Ferramentas maduras")

    # Arrow
    c.setStrokeColor(ACCENT)
    c.setLineWidth(2)
    c.line(MARGIN + 300, timeline_y + 35, MARGIN + 360, timeline_y + 35)
    c.line(MARGIN + 350, timeline_y + 42, MARGIN + 360, timeline_y + 35)
    c.line(MARGIN + 350, timeline_y + 28, MARGIN + 360, timeline_y + 35)

    # Upstream (highlighted)
    draw_box(c, MARGIN + 380, timeline_y, 280, 70, fill=SURFACE, border=ACCENT)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 18)
    c.drawCentredString(MARGIN + 380 + 140, timeline_y + 40, "Upstream")
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 12)
    c.drawCentredString(MARGIN + 380 + 140, timeline_y + 15, "O gap real")


def slide_07_pm_question(c):
    """PM Dilemma"""
    draw_bg(c)
    draw_footer(c, 7, TOTAL_SLIDES, "The PM Dilemma")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 48)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 + 20, "O PM precisa ser t\u00e9cnico?")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Oblique", 16)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 40, "Talvez a pergunta j\u00e1 n\u00e3o fa\u00e7a sentido.")


def slide_08_reframe(c):
    """o16g Quote"""
    draw_bg(c)
    draw_footer(c, 8, TOTAL_SLIDES, "The PM Dilemma")

    # Quote
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 60)
    c.drawString(MARGIN - 5, PAGE_H - 130, "\u201c")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Oblique", 28)
    c.drawString(MARGIN + 20, PAGE_H - 170, "It was never about the code.")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 13)
    c.drawString(MARGIN + 20, PAGE_H - 210, "\u2014 o16g, Outcome Engineering Manifesto")

    # The punchline
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 18)
    c.drawString(MARGIN, PAGE_H - 290, "Se agentes fazem o c\u00f3digo, o que sobra para o time humano?")

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(MARGIN, PAGE_H - 350, "Orquestrar outcomes.")


def slide_09_new_role(c):
    """The New Role"""
    draw_bg(c)
    draw_footer(c, 9, TOTAL_SLIDES, "The PM Dilemma")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 26)
    c.drawString(MARGIN, PAGE_H - 90, "O novo papel")

    # Reframes
    reframes = [
        ("Escrever PRDs perfeitos", "Estruturar contexto que agentes\ne humanos consumam"),
        ("Saber codar", "Entender o suficiente para\norquestrar o fluxo"),
        ("Controlar o backlog", "Garantir que o outcome certo\nrecebe investimento"),
    ]

    y = PAGE_H - 160
    for old, new in reframes:
        # Old (crossed out style)
        draw_box(c, MARGIN, y - 5, 300, 55, fill=SURFACE)
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN + 15, y + 30, "N\u00e3o \u00e9 sobre...")
        c.setFont("Helvetica", 14)
        c.drawString(MARGIN + 15, y + 8, old)
        # Strike through
        w = c.stringWidth(old, "Helvetica", 14)
        c.setStrokeColor(RED_ACCENT)
        c.setLineWidth(1)
        c.line(MARGIN + 13, y + 14, MARGIN + 17 + w, y + 14)

        # Arrow
        c.setStrokeColor(ACCENT)
        c.setLineWidth(1.5)
        c.line(MARGIN + 320, y + 22, MARGIN + 350, y + 22)

        # New
        draw_box(c, MARGIN + 370, y - 5, 340, 55, fill=SURFACE, border=ACCENT)
        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica", 11)
        c.drawString(MARGIN + 385, y + 30, "\u00c9 sobre...")
        c.setFont("Helvetica-Bold", 12)
        new_lines = new.split("\n")
        for j, nl in enumerate(new_lines):
            c.drawString(MARGIN + 385, y + 8 - j * 16, nl)

        y -= 80

    # Bottom quote
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Oblique", 15)
    c.drawString(MARGIN, y - 15, "\"Manage to cost, not capacity.\" \u2014 o16g")


def slide_10_defining(c):
    """Defining Upstream"""
    draw_bg(c)
    draw_footer(c, 10, TOTAL_SLIDES, "What is Upstream")

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(MARGIN, PAGE_H - 80, "UPSTREAM")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, PAGE_H - 130, "Tudo que acontece antes")
    c.drawString(MARGIN, PAGE_H - 170, "do desenvolvimento.")

    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 17)
    y = PAGE_H - 230
    items = [
        "Discovery. Pr\u00e9-discovery. Idea\u00e7\u00e3o. Conceitua\u00e7\u00e3o.",
        "O primeiro diamante do Design Thinking.",
        "",
        "\u00c9 exatamente o espa\u00e7o que a YC quer ver transformado."
    ]
    for item in items:
        if item:
            c.drawString(MARGIN, y, item)
        y -= 30

    # Double diamond hint
    diamond_y = PAGE_H - 430
    # First diamond (highlighted)
    draw_box(c, MARGIN, diamond_y, 300, 60, fill=SURFACE, border=ACCENT)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(MARGIN + 150, diamond_y + 35, "Upstream")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 11)
    c.drawCentredString(MARGIN + 150, diamond_y + 12, "Descobrir + Definir")

    # Second diamond (faded)
    draw_box(c, MARGIN + 340, diamond_y, 300, 60, fill=SURFACE)
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(MARGIN + 340 + 150, diamond_y + 35, "Downstream")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 11)
    c.drawCentredString(MARGIN + 340 + 150, diamond_y + 12, "Desenvolver + Entregar")


def slide_11_why_breaks(c):
    """Why it breaks"""
    draw_bg(c)
    draw_footer(c, 11, TOTAL_SLIDES, "What is Upstream")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 30)
    c.drawString(MARGIN, PAGE_H - 100, "Por que o upstream trava")

    items = [
        ("Sem padr\u00e3o", "Cada time faz diferente"),
        ("Conhecimento em silos", "Produto, design, tech desconectados"),
        ("Ru\u00eddo vira retrabalho", "Informa\u00e7\u00e3o se perde entre etapas"),
        ("Ferramentas focam no hoje", "Falta imaginar o futuro da intera\u00e7\u00e3o humano + AI"),
    ]

    y = PAGE_H - 180
    for title, desc in items:
        draw_box(c, MARGIN, y - 5, PAGE_W - 2 * MARGIN, 55, fill=SURFACE)
        c.setFillColor(RED_ACCENT)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(MARGIN + 15, y + 33, "\u25cf")
        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica-Bold", 15)
        c.drawString(MARGIN + 30, y + 28, title)
        c.setFillColor(TEXT_SECONDARY)
        c.setFont("Helvetica", 13)
        c.drawString(MARGIN + 30, y + 7, desc)
        y -= 70


def slide_12_three_layers(c):
    """The Three Layers"""
    draw_bg(c)
    draw_footer(c, 12, TOTAL_SLIDES, "What is Upstream")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN, PAGE_H - 90, "As 3 camadas do upstream")

    layers = [
        ("Pr\u00e9-demanda", "estrat\u00e9gico", "O que queremos alcan\u00e7ar?", ACCENT),
        ("Demanda definida", "t\u00e1tico", "O que vamos construir?", HexColor("#8B5CF6")),
        ("Demanda detalhada", "operacional", "Como vamos construir?", GREEN_ACCENT),
    ]

    y = PAGE_H - 170
    box_h = 80
    for name, level, question, color in layers:
        draw_box(c, MARGIN, y, PAGE_W - 2 * MARGIN, box_h, fill=SURFACE, border=color)

        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 18)
        c.drawString(MARGIN + 25, y + box_h - 30, name)

        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 12)
        c.drawString(MARGIN + 25, y + box_h - 50, level)

        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica-Oblique", 15)
        c.drawRightString(PAGE_W - MARGIN - 25, y + box_h / 2 - 5, question)

        y -= box_h + 15

        # Arrow between layers
        if y > PAGE_H - 450:
            c.setStrokeColor(TEXT_MUTED)
            c.setLineWidth(1)
            mid_x = PAGE_W / 2
            c.line(mid_x, y + 15, mid_x, y + 5)


def slide_13_craft(c):
    """Craft Tension"""
    draw_bg(c)
    draw_footer(c, 13, TOTAL_SLIDES, "What is Upstream")

    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 14)
    c.drawString(MARGIN, PAGE_H - 80, "O MODELO T CHEGA AO VALE DO SIL\u00cdCIO")

    # Two circles / boxes
    box_y = PAGE_H - 300
    box_h = 120

    draw_box(c, MARGIN, box_y, 300, box_h, fill=SURFACE, border=BORDER)
    c.setFillColor(ORANGE_ACCENT)
    c.setFont("Helvetica-Bold", 17)
    c.drawCentredString(MARGIN + 150, box_y + box_h - 35, "Craft de Processos")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 13)
    c.drawCentredString(MARGIN + 150, box_y + box_h - 60, "Efici\u00eancia, escala,")
    c.drawCentredString(MARGIN + 150, box_y + box_h - 78, "padroniza\u00e7\u00e3o")

    draw_box(c, PAGE_W - MARGIN - 300, box_y, 300, box_h, fill=SURFACE, border=BORDER)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 17)
    c.drawCentredString(PAGE_W - MARGIN - 150, box_y + box_h - 35, "Craft de Produtos")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 13)
    c.drawCentredString(PAGE_W - MARGIN - 150, box_y + box_h - 60, "Criatividade, experimenta\u00e7\u00e3o,")
    c.drawCentredString(PAGE_W - MARGIN - 150, box_y + box_h - 78, "discovery")

    # Overlap indicator
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawCentredString(PAGE_W / 2, box_y + box_h / 2, "+")

    # Bottom
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(PAGE_W / 2, box_y - 60, "N\u00e3o precisamos escolher um lado.")


def slide_14_context_eng(c):
    """Context Engineering title"""
    draw_bg(c)
    draw_footer(c, 14, TOTAL_SLIDES, "Context Engineering")

    draw_accent_line(c, PAGE_H / 2 + 60, 80)

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 48)
    c.drawString(MARGIN, PAGE_H / 2, "Context")
    c.drawString(MARGIN, PAGE_H / 2 - 55, "Engineering")

    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 18)
    c.drawString(MARGIN, PAGE_H / 2 - 110, "A skill cr\u00edtica para usar IA com qualidade.")


def slide_15_context_code(c):
    """Context is the New Code"""
    draw_bg(c)
    draw_footer(c, 15, TOTAL_SLIDES, "Context Engineering")

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawString(MARGIN, PAGE_H - 100, "Context is the new code.")

    # Bullet points
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 16)
    y = PAGE_H - 170
    bullets = [
        "A qualidade do output depende da qualidade do input estruturado",
        "N\u00e3o basta ter a informa\u00e7\u00e3o \u2014 precisa estar organizada",
        "O warmup \u00e9 o environment setup do agente",
    ]
    for b in bullets:
        c.setFillColor(ACCENT)
        c.setFont("Helvetica", 12)
        c.drawString(MARGIN, y + 2, "\u25b8")
        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica", 16)
        c.drawString(MARGIN + 20, y, b)
        y -= 35

    # Flow diagram
    flow_y = PAGE_H - 380

    # Input
    draw_box(c, MARGIN, flow_y, 220, 70, fill=SURFACE, border=ACCENT)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 13)
    c.drawCentredString(MARGIN + 110, flow_y + 42, "Contexto Estruturado")
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 10)
    c.drawCentredString(MARGIN + 110, flow_y + 18, "warmup-project + warmup-tech")

    # Arrow
    c.setStrokeColor(ACCENT)
    c.setLineWidth(2)
    c.line(MARGIN + 240, flow_y + 35, MARGIN + 290, flow_y + 35)

    # Outputs
    outputs = [
        ("Prot\u00f3tipo", ACCENT),
        ("Backlog", HexColor("#8B5CF6")),
        ("C\u00f3digo", GREEN_ACCENT),
    ]
    out_x = MARGIN + 310
    for i, (label, color) in enumerate(outputs):
        oy = flow_y + 50 - i * 28
        draw_box(c, out_x, oy, 130, 24, fill=SURFACE, border=color)
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 11)
        c.drawCentredString(out_x + 65, oy + 6, label)

    # Bottom
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica-Oblique", 15)
    c.drawString(MARGIN, flow_y - 30, "Mesmo input, diferentes outputs.")


def slide_16_transition(c):
    """Transition to practice"""
    draw_bg(c)
    draw_footer(c, 16, TOTAL_SLIDES, "Context Engineering")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 32)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 + 20, "Agora que entendemos o problema")
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 25, "e o papel do contexto,")

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 36)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 90, "vamos ver na pr\u00e1tica.")


def slide_17_hydra(c):
    """Meet Hydra"""
    draw_bg(c)
    draw_footer(c, 17, TOTAL_SLIDES, "The Case")

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, PAGE_H - 80, "O CASE")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 38)
    c.drawString(MARGIN, PAGE_H - 130, "Hydra")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 20)
    c.drawString(MARGIN + 170, PAGE_H - 127, "\u2014 Daily Hydration Tracker")

    # Details
    details = [
        ("Dom\u00ednio", "Beber \u00e1gua. Meta di\u00e1ria. Streaks."),
        ("Stack", "Next.js, TypeScript, Tailwind, shadcn/ui"),
        ("Abordagem", "Local-first, sem backend no MVP"),
        ("Personas", "Ana (desk worker) + Lucas (habit builder)"),
    ]

    y = PAGE_H - 210
    for label, value in details:
        draw_box(c, MARGIN, y - 5, PAGE_W - 2 * MARGIN, 40, fill=SURFACE)
        c.setFillColor(ACCENT)
        c.setFont("Helvetica-Bold", 12)
        c.drawString(MARGIN + 15, y + 8, label)
        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica", 13)
        c.drawString(MARGIN + 150, y + 8, value)
        y -= 50

    # Bottom note
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Oblique", 14)
    c.drawString(MARGIN, y - 20, "Propositalmente simples. O ponto \u00e9 o processo, n\u00e3o o produto.")


def slide_18_context_files(c):
    """The Structured Context"""
    draw_bg(c)
    draw_footer(c, 18, TOTAL_SLIDES, "The Case")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN, PAGE_H - 100, "O contexto que preparamos")

    # Two files
    files = [
        ("warmup-project.md", "Vis\u00e3o, personas, features,\nm\u00e9tricas de sucesso, constraints", ACCENT),
        ("warmup-tech.md", "Stack, arquitetura, data model,\npadr\u00f5es de c\u00f3digo, design system", HexColor("#8B5CF6")),
    ]

    file_y = PAGE_H - 230
    for fname, desc, color in files:
        draw_box(c, MARGIN, file_y, 320, 80, fill=SURFACE, border=color)
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(MARGIN + 20, file_y + 52, fname)
        c.setFillColor(TEXT_SECONDARY)
        c.setFont("Helvetica", 12)
        for j, line in enumerate(desc.split("\n")):
            c.drawString(MARGIN + 20, file_y + 28 - j * 16, line)
        file_y -= 100

    # Flow to cases
    flow_x = MARGIN + 380
    flow_y = PAGE_H - 230

    # Arrow from files
    c.setStrokeColor(TEXT_MUTED)
    c.setLineWidth(1.5)
    c.line(MARGIN + 330, PAGE_H - 260, flow_x, PAGE_H - 260)

    cases_out = [
        ("Case 1: Prototype", ACCENT),
        ("Case 2: Scope", HexColor("#8B5CF6")),
        ("Case 3: Code", GREEN_ACCENT),
    ]

    for i, (label, color) in enumerate(cases_out):
        cy = flow_y - i * 55
        draw_box(c, flow_x + 20, cy, 200, 40, fill=SURFACE, border=color)
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 13)
        c.drawCentredString(flow_x + 120, cy + 12, label)

    # Bottom
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(MARGIN, file_y - 30, "Esse contexto alimenta todos os cases.")


def slide_19_case1(c):
    """Case 1: Design Experiments"""
    draw_bg(c)
    draw_footer(c, 19, TOTAL_SLIDES, "Cases")

    # Case label
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, PAGE_H - 75, "CASE 1")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, PAGE_H - 120, "Design Experiments")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 16)
    c.drawString(MARGIN, PAGE_H - 150, "Prototipa\u00e7\u00e3o r\u00e1pida com guardrails de produto")

    # Problem
    draw_box(c, MARGIN, PAGE_H - 250, PAGE_W / 2 - MARGIN - 20, 75, fill=SURFACE)
    c.setFillColor(RED_ACCENT)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN + 15, PAGE_H - 192, "O PROBLEMA")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN + 15, PAGE_H - 212, "Ferramentas geram output bonito,")
    c.drawString(MARGIN + 15, PAGE_H - 228, "mas desconectado do produto real.")

    # Solution
    draw_box(c, PAGE_W / 2 + 10, PAGE_H - 250, PAGE_W / 2 - MARGIN - 20, 75, fill=SURFACE, border=ACCENT)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(PAGE_W / 2 + 25, PAGE_H - 192, "O QUE VAMOS FAZER")
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 12)
    c.drawString(PAGE_W / 2 + 25, PAGE_H - 212, "Prototipar a Daily Insights Card")
    c.drawString(PAGE_W / 2 + 25, PAGE_H - 228, "com contexto estruturado.")

    # Key message
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 20)
    c.drawString(MARGIN, PAGE_H - 310, "Experimente r\u00e1pido, mas com contexto.")

    # What the audience sees
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 12)
    y = PAGE_H - 370
    outputs = [
        "\u25b8  Prot\u00f3tipo funcional gerado em minutos",
        "\u25b8  Usando componentes do design system real",
        "\u25b8  Respeitando padr\u00f5es t\u00e9cnicos do projeto",
        "\u25b8  Conectado \u00e0 vis\u00e3o de produto documentada",
    ]
    for o in outputs:
        c.drawString(MARGIN, y, o)
        y -= 22


def slide_20_case2(c):
    """Case 2: Scope Planning"""
    draw_bg(c)
    draw_footer(c, 20, TOTAL_SLIDES, "Cases")

    c.setFillColor(HexColor("#8B5CF6"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, PAGE_H - 75, "CASE 2")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, PAGE_H - 120, "Scope Planning")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 16)
    c.drawString(MARGIN, PAGE_H - 150, "Do experimento ao backlog estruturado")

    # Problem
    draw_box(c, MARGIN, PAGE_H - 250, PAGE_W / 2 - MARGIN - 20, 75, fill=SURFACE)
    c.setFillColor(RED_ACCENT)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN + 15, PAGE_H - 192, "O PROBLEMA")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 12)
    c.drawString(MARGIN + 15, PAGE_H - 212, "A transi\u00e7\u00e3o de 'ideia aprovada' para")
    c.drawString(MARGIN + 15, PAGE_H - 228, "'time pronto para executar' \u00e9 ca\u00f3tica.")

    # Solution
    draw_box(c, PAGE_W / 2 + 10, PAGE_H - 250, PAGE_W / 2 - MARGIN - 20, 75, fill=SURFACE, border=HexColor("#8B5CF6"))
    c.setFillColor(HexColor("#8B5CF6"))
    c.setFont("Helvetica-Bold", 12)
    c.drawString(PAGE_W / 2 + 25, PAGE_H - 192, "O QUE VAMOS FAZER")
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 12)
    c.drawString(PAGE_W / 2 + 25, PAGE_H - 212, "Prot\u00f3tipo \u2192 Initiative \u2192 User Stories")
    c.drawString(PAGE_W / 2 + 25, PAGE_H - 228, "\u2192 Tasks t\u00e9cnicas (DoR)")

    # Key message
    c.setFillColor(HexColor("#8B5CF6"))
    c.setFont("Helvetica-Bold", 20)
    c.drawString(MARGIN, PAGE_H - 310, "IA prop\u00f5e, PM aprova.")

    # Pipeline
    pipeline_y = PAGE_H - 410
    steps = ["Prototype", "Initiative", "Classification", "User Stories", "Tasks"]
    step_w = 120
    gap = 15
    for i, step in enumerate(steps):
        x = MARGIN + i * (step_w + gap)
        color = HexColor("#8B5CF6") if i > 0 else ACCENT
        draw_box(c, x, pipeline_y, step_w, 35, fill=SURFACE, border=color)
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 10)
        c.drawCentredString(x + step_w / 2, pipeline_y + 11, step)
        if i < len(steps) - 1:
            c.setStrokeColor(TEXT_MUTED)
            c.setLineWidth(1)
            c.line(x + step_w + 2, pipeline_y + 17, x + step_w + 12, pipeline_y + 17)


def slide_21_case3(c):
    """Case 3: Implementation"""
    draw_bg(c)
    draw_footer(c, 21, TOTAL_SLIDES, "Cases")

    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(MARGIN, PAGE_H - 75, "CASE 3 (BONUS)")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 32)
    c.drawString(MARGIN, PAGE_H - 120, "Feature Implementation")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 16)
    c.drawString(MARGIN, PAGE_H - 150, "Do backlog ao c\u00f3digo com IA")

    # What we'll do
    draw_box(c, MARGIN, PAGE_H - 260, PAGE_W - 2 * MARGIN, 80, fill=SURFACE, border=GREEN_ACCENT)
    c.setFillColor(GREEN_ACCENT)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(MARGIN + 20, PAGE_H - 198, "O QUE VAMOS FAZER")
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica", 14)
    c.drawString(MARGIN + 20, PAGE_H - 220, "Pegar uma task do Case 2 e implementar ao vivo no codebase do Hydra.")
    c.setFillColor(TEXT_SECONDARY)
    c.setFont("Helvetica", 13)
    c.drawString(MARGIN + 20, PAGE_H - 242, "O mesmo contexto que nasceu no upstream chega no c\u00f3digo.")

    # The complete loop
    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(MARGIN, PAGE_H - 330, "O loop completo fecha:")

    loop_y = PAGE_H - 410
    loop_items = [
        ("Experiment", ACCENT),
        ("Structure", HexColor("#8B5CF6")),
        ("Implement", GREEN_ACCENT),
    ]
    box_w = 180
    gap = 30
    for i, (label, color) in enumerate(loop_items):
        x = MARGIN + i * (box_w + gap)
        draw_box(c, x, loop_y, box_w, 50, fill=SURFACE, border=color)
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 16)
        c.drawCentredString(x + box_w / 2, loop_y + 17, label)
        if i < 2:
            c.setStrokeColor(TEXT_MUTED)
            c.setLineWidth(1.5)
            ax = x + box_w + 5
            c.line(ax, loop_y + 25, ax + 20, loop_y + 25)
            c.line(ax + 15, loop_y + 30, ax + 20, loop_y + 25)
            c.line(ax + 15, loop_y + 20, ax + 20, loop_y + 25)


def slide_22_lets_go(c):
    """Let's go - transition to live"""
    draw_bg(c)

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 48)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 + 20, "Vamos para a tela.")

    # Terminal cursor blink hint
    c.setFillColor(ACCENT)
    c.setFont("Helvetica", 18)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 40, "\u25ae")

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 14)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 80, "A partir de agora, tudo ao vivo.")


def slide_23_loop(c):
    """The Complete Loop - Closing"""
    draw_bg(c)
    draw_footer(c, 23, TOTAL_SLIDES, "Closing")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN, PAGE_H - 90, "O loop completo")

    steps = [
        ("Experimentar com contexto", ACCENT),
        ("Estruturar com consist\u00eancia", HexColor("#8B5CF6")),
        ("Implementar com rastreabilidade", GREEN_ACCENT),
        ("Mapear onde trava e ajustar\nantes de escalar", ORANGE_ACCENT),
    ]

    y = PAGE_H - 170
    for i, (text, color) in enumerate(steps):
        # Number circle
        c.setFillColor(color)
        c.circle(MARGIN + 20, y + 8, 16, fill=1, stroke=0)
        c.setFillColor(BG_DARK)
        c.setFont("Helvetica-Bold", 14)
        c.drawCentredString(MARGIN + 20, y + 2, str(i + 1))

        # Text
        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica-Bold", 18)
        lines = text.split("\n")
        for j, line in enumerate(lines):
            c.drawString(MARGIN + 50, y + 2 - j * 22, line)

        y -= 80

        # Arrow between steps
        if i < len(steps) - 1:
            c.setStrokeColor(TEXT_MUTED)
            c.setLineWidth(1)
            c.line(MARGIN + 20, y + 60, MARGIN + 20, y + 45)


def slide_24_takeaways(c):
    """Key Takeaways"""
    draw_bg(c)
    draw_footer(c, 24, TOTAL_SLIDES, "Closing")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(MARGIN, PAGE_H - 90, "O que levar daqui")

    takeaways = [
        ("Context is the new code", "Invista em estruturar antes de escalar", ACCENT),
        ("Guardrails aceleram", "Constraints n\u00e3o limitam, convergem", HexColor("#8B5CF6")),
        ("IA como copiloto consistente", "Do upstream ao c\u00f3digo, n\u00e3o ferramenta pontual", GREEN_ACCENT),
        ("O upstream \u00e9 a pr\u00f3xima fronteira", "E j\u00e1 d\u00e1 para come\u00e7ar", ORANGE_ACCENT),
    ]

    y = PAGE_H - 170
    for title, desc, color in takeaways:
        draw_box(c, MARGIN, y - 10, PAGE_W - 2 * MARGIN, 60, fill=SURFACE, border=color)
        c.setFillColor(color)
        c.setFont("Helvetica-Bold", 16)
        c.drawString(MARGIN + 20, y + 25, title)
        c.setFillColor(TEXT_SECONDARY)
        c.setFont("Helvetica", 13)
        c.drawString(MARGIN + 20, y + 3, desc)
        y -= 75


def slide_25_comparison(c):
    """Comparison table"""
    draw_bg(c)
    draw_footer(c, 25, TOTAL_SLIDES, "Closing")

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 24)
    c.drawCentredString(PAGE_W / 2, PAGE_H - 90, "De l\u00e1 para c\u00e1")

    # Table
    col1_x = MARGIN + 40
    col2_x = PAGE_W / 2 + 40
    header_y = PAGE_H - 160

    # Headers
    draw_box(c, MARGIN, header_y - 10, PAGE_W / 2 - MARGIN - 10, 40, fill=SURFACE)
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(col1_x, header_y + 5, "LTS Anterior (30/01)")

    draw_box(c, PAGE_W / 2 + 10, header_y - 10, PAGE_W / 2 - MARGIN - 10, 40, fill=SURFACE, border=ACCENT)
    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(col2_x, header_y + 5, "Este Workshop (13/02)")

    rows = [
        ("Mostrou O QU\u00ca aprendemos", "Ensinou COMO estruturar"),
        ("Formato: palestra", "Formato: hands-on"),
        ("Conceitos e dados", "Ferramentas e fluxos ao vivo"),
        ("\"A matem\u00e1tica n\u00e3o fecha\"", "\"Como fazer a matem\u00e1tica\nfechar no upstream\""),
    ]

    y = header_y - 60
    for left, right in rows:
        c.setFillColor(TEXT_MUTED)
        c.setFont("Helvetica", 14)
        c.drawString(col1_x, y, left)

        c.setFillColor(TEXT_PRIMARY)
        c.setFont("Helvetica-Bold", 14)
        lines = right.split("\n")
        for j, line in enumerate(lines):
            c.drawString(col2_x, y - j * 18, line)

        y -= 55


def slide_26_close(c):
    """Closing quote"""
    draw_bg(c)

    # Accent lines
    c.setStrokeColor(ACCENT)
    c.setLineWidth(2)
    c.line(PAGE_W / 2 - 200, PAGE_H / 2 + 60, PAGE_W / 2 + 200, PAGE_H / 2 + 60)

    c.setFillColor(ACCENT)
    c.setFont("Helvetica-Bold", 28)
    text = "Context is the new code \u2014"
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 + 15, text)

    c.setFillColor(TEXT_PRIMARY)
    c.setFont("Helvetica-Bold", 28)
    c.drawCentredString(PAGE_W / 2, PAGE_H / 2 - 25, "estruture antes de escalar.")

    c.setStrokeColor(ACCENT)
    c.setLineWidth(2)
    c.line(PAGE_W / 2 - 200, PAGE_H / 2 - 60, PAGE_W / 2 + 200, PAGE_H / 2 - 60)

    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 14)
    c.drawCentredString(PAGE_W / 2, 60, "Obrigado. Perguntas?")


def main():
    output_path = os.path.join(
        os.path.dirname(os.path.abspath(__file__)),
        "upstream-workshop-presentation.pdf"
    )

    c = canvas.Canvas(output_path, pagesize=landscape(A4))
    c.setTitle("Upstream: A Pr\u00f3xima Fronteira - LTS Workshop 13/02/2026")
    c.setAuthor("JV")
    c.setSubject("Leading Tech Session - Workshop Pr\u00e1tico")

    slides = [
        slide_01_title,
        slide_02_recap,
        slide_03_promise,
        slide_04_signal,
        slide_05_quote_ym,
        slide_06_frontier,
        slide_07_pm_question,
        slide_08_reframe,
        slide_09_new_role,
        slide_10_defining,
        slide_11_why_breaks,
        slide_12_three_layers,
        slide_13_craft,
        slide_14_context_eng,
        slide_15_context_code,
        slide_16_transition,
        slide_17_hydra,
        slide_18_context_files,
        slide_19_case1,
        slide_20_case2,
        slide_21_case3,
        slide_22_lets_go,
        slide_23_loop,
        slide_24_takeaways,
        slide_25_comparison,
        slide_26_close,
    ]

    for i, slide_fn in enumerate(slides):
        slide_fn(c)
        if i < len(slides) - 1:
            c.showPage()

    c.save()
    print(f"PDF generated: {output_path}")
    print(f"Total slides: {len(slides)}")


if __name__ == "__main__":
    main()
