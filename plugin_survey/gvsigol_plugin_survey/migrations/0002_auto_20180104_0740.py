# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2018-01-04 07:40
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('gvsigol_plugin_survey', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='surveysection',
            name='definition',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='survey',
            name='project',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, to='gvsigol_core.Project'),
        ),
    ]